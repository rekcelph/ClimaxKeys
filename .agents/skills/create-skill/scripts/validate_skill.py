#!/usr/bin/env python3
"""Validate a portable Agent Skill directory."""

from __future__ import annotations

import sys
sys.dont_write_bytecode = True

import argparse
import json
from pathlib import Path

from skill_utils import validate_skill


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill", type=Path, help="Skill directory or SKILL.md path.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as a failing result.")
    parser.add_argument("--quiet", action="store_true", help="Print only the final summary unless JSON is requested.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    issues = validate_skill(args.skill)
    errors = [item for item in issues if item.severity == "error"]
    warnings = [item for item in issues if item.severity == "warning"]

    if args.json:
        print(json.dumps({
            "skill": str(args.skill),
            "valid": not errors and not (args.strict and warnings),
            "errors": len(errors),
            "warnings": len(warnings),
            "issues": [item.to_dict() for item in issues],
        }, indent=2))
    else:
        if not args.quiet:
            for item in issues:
                print("{0}: {1} [{2}]\n  {3}".format(item.severity.upper(), item.message, item.code, item.path))
        status = "PASS" if not errors and not (args.strict and warnings) else "FAIL"
        print("{0}: {1} error(s), {2} warning(s)".format(status, len(errors), len(warnings)))

    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
