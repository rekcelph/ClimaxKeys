#!/usr/bin/env python3
"""Install a skill for Antigravity, Codex, or both."""

from __future__ import annotations

import sys
sys.dont_write_bytecode = True

import argparse
import shutil
import subprocess
from pathlib import Path
from typing import Iterable, List, Tuple

from skill_utils import SkillFormatError, load_skill, validate_skill

IGNORE_NAMES = {".git", "__pycache__", ".DS_Store", "dist"}
IGNORE_SUFFIXES = {".pyc", ".pyo", ".zip"}


def detect_repo_root(start: Path) -> Path:
    try:
        result = subprocess.run(
            ["git", "-C", str(start), "rev-parse", "--show-toplevel"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return Path(result.stdout.strip()).resolve()
    except (FileNotFoundError, subprocess.CalledProcessError):
        return start.resolve()


def copy_ignore(_directory: str, names: List[str]) -> Iterable[str]:
    ignored = []
    for name in names:
        path = Path(name)
        if name in IGNORE_NAMES or path.suffix in IGNORE_SUFFIXES:
            ignored.append(name)
    return ignored


def destinations(name: str, target: str, scope: str, repo: Path) -> List[Tuple[str, Path]]:
    if scope == "repo":
        return [("shared repository", repo / ".agents" / "skills" / name)]

    result: List[Tuple[str, Path]] = []
    home = Path.home()
    if target in {"antigravity", "both"}:
        result.append(("Antigravity user", home / ".gemini" / "config" / "skills" / name))
    if target in {"codex", "both"}:
        result.append(("Codex user", home / ".agents" / "skills" / name))
    return result


def remove_existing(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def install_one(source: Path, destination: Path, mode: str, replace: bool, dry_run: bool) -> str:
    source_resolved = source.resolve()
    try:
        if destination.exists() and destination.resolve() == source_resolved:
            return "already installed at source path"
    except OSError:
        pass

    if destination.exists() or destination.is_symlink():
        if not replace:
            raise FileExistsError("destination exists; use --replace after reviewing it: {0}".format(destination))
        if not dry_run:
            remove_existing(destination)

    if dry_run:
        return "would {0} to {1}".format(mode, destination)

    destination.parent.mkdir(parents=True, exist_ok=True)
    if mode == "symlink":
        destination.symlink_to(source_resolved, target_is_directory=True)
    else:
        shutil.copytree(source_resolved, destination, ignore=copy_ignore)
    return "installed by {0}".format(mode)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill", type=Path, help="Source skill directory or SKILL.md path.")
    parser.add_argument("--target", choices=("antigravity", "codex", "both"), default="both")
    parser.add_argument("--scope", choices=("user", "repo"), default="user")
    parser.add_argument("--repo", type=Path, help="Repository root for repo scope. Defaults to detected Git root or CWD.")
    parser.add_argument("--mode", choices=("copy", "symlink"), default="copy")
    parser.add_argument("--replace", action="store_true", help="Replace an existing destination.")
    parser.add_argument("--dry-run", action="store_true", help="Show destinations without writing files.")
    parser.add_argument("--skip-validation", action="store_true", help="Install even when validation has errors.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        source, data, _body, _raw = load_skill(args.skill)
    except SkillFormatError as exc:
        print("ERROR: {0}".format(exc), file=sys.stderr)
        return 2

    issues = validate_skill(source)
    errors = [item for item in issues if item.severity == "error"]
    if errors and not args.skip_validation:
        print("ERROR: source skill has validation errors; run validate_skill.py first.", file=sys.stderr)
        for issue in errors:
            print("- {0}: {1}".format(issue.code, issue.message), file=sys.stderr)
        return 2

    name = data["name"].strip()
    repo_start = args.repo.expanduser() if args.repo else Path.cwd()
    repo = repo_start.resolve() if args.repo else detect_repo_root(repo_start)

    if args.scope == "repo" and args.target != "both":
        print("NOTE: repository scope uses the same .agents/skills location for both hosts.")

    failed = False
    for label, destination in destinations(name, args.target, args.scope, repo):
        try:
            result = install_one(source, destination, args.mode, args.replace, args.dry_run)
        except (OSError, FileExistsError) as exc:
            failed = True
            print("ERROR: {0}: {1}".format(label, exc), file=sys.stderr)
        else:
            print("{0}: {1} ({2})".format(label, destination, result))

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
