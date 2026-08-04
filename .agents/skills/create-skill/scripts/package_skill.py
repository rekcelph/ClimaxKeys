#!/usr/bin/env python3
"""Create a deterministic ZIP archive of a validated Agent Skill."""

from __future__ import annotations

import sys
sys.dont_write_bytecode = True

import argparse
import hashlib
import os
import zipfile
from pathlib import Path
from typing import List

from skill_utils import SkillFormatError, extract_metadata_value, load_skill, validate_skill

IGNORE_PARTS = {".git", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache", "dist"}
IGNORE_NAMES = {".DS_Store", ".env"}
IGNORE_SUFFIXES = {".pyc", ".pyo", ".zip"}
FIXED_TIME = (1980, 1, 1, 0, 0, 0)


def should_include(path: Path, root: Path, output: Path) -> bool:
    if path.resolve() == output.resolve():
        return False
    relative = path.relative_to(root)
    if any(part in IGNORE_PARTS for part in relative.parts):
        return False
    if path.name in IGNORE_NAMES or path.suffix in IGNORE_SUFFIXES:
        return False
    return path.is_file()


def files_to_package(root: Path, output: Path) -> List[Path]:
    return sorted(path for path in root.rglob("*") if should_include(path, root, output))


def archive_path(output_arg: Path, name: str, version: str) -> Path:
    output_arg = output_arg.expanduser()
    if output_arg.suffix.lower() == ".zip":
        return output_arg.resolve()
    filename = "{0}-v{1}.zip".format(name, version) if version else "{0}.zip".format(name)
    return (output_arg / filename).resolve()


def add_file(archive: zipfile.ZipFile, root: Path, path: Path) -> None:
    relative = Path(root.name) / path.relative_to(root)
    data = path.read_bytes()
    info = zipfile.ZipInfo(str(relative).replace(os.sep, "/"), FIXED_TIME)
    info.compress_type = zipfile.ZIP_DEFLATED
    mode = 0o755 if path.parent.name == "scripts" and path.suffix in {".py", ".sh"} else 0o644
    info.external_attr = mode << 16
    archive.writestr(info, data)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill", type=Path, help="Skill directory or SKILL.md path.")
    parser.add_argument("--output", type=Path, default=Path.cwd() / "dist", help="ZIP path or output directory.")
    parser.add_argument("--strict", action="store_true", help="Refuse packaging when validation has warnings.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        root, data, _body, raw_lines = load_skill(args.skill)
    except SkillFormatError as exc:
        print("ERROR: {0}".format(exc), file=sys.stderr)
        return 2

    issues = validate_skill(root)
    errors = [item for item in issues if item.severity == "error"]
    warnings = [item for item in issues if item.severity == "warning"]
    if errors or (args.strict and warnings):
        print("ERROR: validation failed; archive was not created.", file=sys.stderr)
        for item in issues:
            print("- {0}: {1} [{2}]".format(item.severity.upper(), item.message, item.code), file=sys.stderr)
        return 2

    version = extract_metadata_value(raw_lines, "version") or ""
    output = archive_path(args.output, data["name"], version)
    output.parent.mkdir(parents=True, exist_ok=True)
    paths = files_to_package(root, output)
    if not paths:
        print("ERROR: no files found to package.", file=sys.stderr)
        return 2

    with zipfile.ZipFile(output, "w") as archive:
        for path in paths:
            add_file(archive, root, path)

    print("Created: {0}".format(output))
    print("Files: {0}".format(len(paths)))
    print("SHA256: {0}".format(sha256(output)))
    if warnings:
        print("Warnings: {0}".format(len(warnings)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
