#!/usr/bin/env python3
"""Create a portable Agent Skill scaffold from bundled templates."""

from __future__ import annotations

import sys
sys.dont_write_bytecode = True

import argparse
import re
from pathlib import Path
from typing import Dict

from skill_utils import NAME_RE, validate_skill

SKILL_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_ROOT = SKILL_ROOT / "assets" / "skill-template"


def title_from_name(name: str) -> str:
    return " ".join(part.capitalize() for part in name.split("-"))


def short_description(description: str, maximum: int = 80) -> str:
    compact = " ".join(description.split())
    first = re.split(r"(?<=[.!?])\s+", compact, maxsplit=1)[0]
    if len(first) <= maximum:
        return first.rstrip(".")
    return first[: maximum - 1].rstrip() + "…"


def render(template: Path, values: Dict[str, str]) -> str:
    text = template.read_text(encoding="utf-8")
    for key, value in values.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError("Refusing to overwrite existing file: {0}".format(path))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", required=True, help="Lowercase hyphenated skill name.")
    parser.add_argument("--description", required=True, help="Routing description including when to use the skill.")
    parser.add_argument("--output", type=Path, default=Path.cwd(), help="Parent directory for the new skill.")
    parser.add_argument("--title", help="Human-readable title. Defaults to title-cased skill name.")
    parser.add_argument("--profile", choices=("minimal", "standard", "full"), default="standard", help="Scaffold size. Default: standard.")
    parser.add_argument("--force", action="store_true", help="Overwrite template-owned files in an existing directory.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    name = args.name.strip()
    description = " ".join(args.description.split())
    title = args.title.strip() if args.title else title_from_name(name)

    if not NAME_RE.fullmatch(name) or len(name) > 64:
        print("ERROR: --name must be 1-64 lowercase letters/digits separated by single hyphens.", file=sys.stderr)
        return 2
    if not description or len(description) > 1024:
        print("ERROR: --description must contain 1-1024 characters.", file=sys.stderr)
        return 2
    if "use when" not in description.lower() and "use this" not in description.lower():
        print("WARNING: description does not explicitly say when the skill should be used.", file=sys.stderr)

    destination = args.output.expanduser().resolve() / name
    if destination.exists() and not destination.is_dir():
        print("ERROR: destination exists and is not a directory: {0}".format(destination), file=sys.stderr)
        return 2
    if destination.exists() and any(destination.iterdir()) and not args.force:
        print("ERROR: destination is not empty; pass --force only after reviewing it: {0}".format(destination), file=sys.stderr)
        return 2
    destination.mkdir(parents=True, exist_ok=True)

    values = {
        "SKILL_NAME": name,
        "SKILL_DESCRIPTION": description,
        "SKILL_TITLE": title,
        "SHORT_DESCRIPTION": short_description(description),
    }

    skill_content = render(TEMPLATE_ROOT / "SKILL.md.tmpl", values)
    support_sections = []
    if args.profile in {"standard", "full"}:
        support_sections.append(
            "## Supporting reference\n\n"
            "Read `references/REFERENCE.md` only when detailed background is needed. "
            "Replace that starter file with focused domain guidance or remove it.\n"
        )
    if args.profile == "full":
        support_sections.append(
            "## Deterministic helper\n\n"
            "Replace `scripts/example.py` with the required deterministic behavior, then run it with Python 3. "
            "Remove the script when instructions alone are sufficient.\n"
        )
        support_sections.append(
            "## Assets\n\n"
            "Use `assets/` only for templates or static files consumed by this workflow.\n"
        )
    if support_sections:
        skill_content = skill_content.rstrip() + "\n\n" + "\n\n".join(support_sections).rstrip() + "\n"

    try:
        write_file(destination / "SKILL.md", skill_content, args.force)
        if args.profile in {"standard", "full"}:
            write_file(destination / "agents" / "openai.yaml", render(TEMPLATE_ROOT / "agents" / "openai.yaml.tmpl", values), args.force)
            write_file(destination / "references" / "REFERENCE.md", render(TEMPLATE_ROOT / "references" / "REFERENCE.md.tmpl", values), args.force)
        if args.profile == "full":
            write_file(destination / "scripts" / "example.py", render(TEMPLATE_ROOT / "scripts" / "example.py.tmpl", values), args.force)
            write_file(destination / "assets" / "README.md", render(TEMPLATE_ROOT / "assets" / "README.md.tmpl", values), args.force)
    except FileExistsError as exc:
        print("ERROR: {0}".format(exc), file=sys.stderr)
        return 2

    issues = validate_skill(destination)
    errors = [item for item in issues if item.severity == "error"]
    warnings = [item for item in issues if item.severity == "warning"]
    print("Created: {0}".format(destination))
    print("Validation: {0} error(s), {1} warning(s)".format(len(errors), len(warnings)))
    for issue in issues:
        print("- {0}: {1} [{2}]".format(issue.severity.upper(), issue.message, issue.code))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
