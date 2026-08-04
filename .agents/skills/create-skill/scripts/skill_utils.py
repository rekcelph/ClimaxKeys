#!/usr/bin/env python3
"""Shared parsing and validation helpers for portable Agent Skills."""

from __future__ import annotations

import ast
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
TOP_LEVEL_KEY_RE = re.compile(r"^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$")
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
LOCAL_PATH_RE = re.compile(
    r"(?<![A-Za-z0-9_.-])((?:scripts|references|assets|agents)/[A-Za-z0-9_.@+%/\\-]+)"
)
KNOWN_TOP_LEVEL_FIELDS = {
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
}


@dataclass(frozen=True)
class ValidationIssue:
    severity: str
    code: str
    message: str
    path: str

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


class SkillFormatError(ValueError):
    """Raised when SKILL.md cannot be parsed safely."""


def _decode_scalar(value: str) -> str:
    value = value.strip()
    if not value:
        return ""
    if value[0:1] in {"'", '"'}:
        try:
            decoded = ast.literal_eval(value)
            return str(decoded)
        except (SyntaxError, ValueError):
            return value.strip("'\"")
    return value


def parse_frontmatter(text: str) -> Tuple[Dict[str, str], str, List[str]]:
    """Parse the top-level YAML subset required for skill validation."""
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = normalized.split("\n")
    if not lines or lines[0].strip() != "---":
        raise SkillFormatError("SKILL.md must begin with YAML frontmatter delimiter '---'.")

    closing = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            closing = index
            break
    if closing is None:
        raise SkillFormatError("SKILL.md frontmatter is missing its closing '---' delimiter.")

    raw_lines = lines[1:closing]
    data: Dict[str, str] = {}
    index = 0
    while index < len(raw_lines):
        line = raw_lines[index]
        if not line.strip() or line.lstrip().startswith("#") or line[:1].isspace():
            index += 1
            continue
        match = TOP_LEVEL_KEY_RE.match(line)
        if not match:
            index += 1
            continue
        key, raw_value = match.group(1), (match.group(2) or "")
        marker = raw_value.strip()
        if marker in {"|", "|-", "|+", ">", ">-", ">+"}:
            block: List[str] = []
            index += 1
            while index < len(raw_lines):
                candidate = raw_lines[index]
                if candidate and not candidate[:1].isspace():
                    break
                block.append(candidate.lstrip())
                index += 1
            if marker.startswith(">"):
                data[key] = " ".join(part.strip() for part in block if part.strip())
            else:
                data[key] = "\n".join(block).rstrip("\n")
            continue
        data[key] = _decode_scalar(raw_value)
        index += 1

    body = "\n".join(lines[closing + 1 :]).lstrip("\n")
    return data, body, raw_lines


def load_skill(skill_path: Path) -> Tuple[Path, Dict[str, str], str, List[str]]:
    path = skill_path.expanduser()
    if path.is_file() and path.name == "SKILL.md":
        root = path.parent
        skill_file = path
    else:
        root = path
        skill_file = root / "SKILL.md"
    if not skill_file.is_file():
        raise SkillFormatError("SKILL.md was not found at: {0}".format(skill_file))
    try:
        text = skill_file.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise SkillFormatError("SKILL.md must be UTF-8 encoded: {0}".format(exc))
    data, body, raw_lines = parse_frontmatter(text)
    return root, data, body, raw_lines


def _issue(severity: str, code: str, message: str, path: Path) -> ValidationIssue:
    return ValidationIssue(severity, code, message, str(path))


def _candidate_local_references(body: str) -> Iterable[str]:
    seen = set()
    for target in MARKDOWN_LINK_RE.findall(body):
        target = target.strip().split("#", 1)[0].split("?", 1)[0]
        if not target or "://" in target or target.startswith(("mailto:", "#", "/")):
            continue
        if target not in seen:
            seen.add(target)
            yield target
    for target in LOCAL_PATH_RE.findall(body):
        target = target.rstrip(".,;:)")
        if target not in seen:
            seen.add(target)
            yield target


def validate_skill(skill_path: Path) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    try:
        root, data, body, raw_lines = load_skill(skill_path)
    except SkillFormatError as exc:
        issues.append(_issue("error", "format", str(exc), skill_path.expanduser()))
        return issues

    skill_file = root / "SKILL.md"
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    compatibility = data.get("compatibility", "").strip()

    if not name:
        issues.append(_issue("error", "missing-name", "Required frontmatter field 'name' is missing or empty.", skill_file))
    else:
        if len(name) > 64:
            issues.append(_issue("error", "name-length", "Skill name exceeds 64 characters.", skill_file))
        if not NAME_RE.fullmatch(name):
            issues.append(_issue("error", "name-format", "Skill name must use lowercase ASCII letters, digits, and single hyphens only.", skill_file))
        if root.name != name:
            issues.append(_issue("error", "name-directory-mismatch", "Frontmatter name '{0}' does not match directory '{1}'.".format(name, root.name), skill_file))

    if not description:
        issues.append(_issue("error", "missing-description", "Required frontmatter field 'description' is missing or empty.", skill_file))
    else:
        if len(description) > 1024:
            issues.append(_issue("error", "description-length", "Description exceeds 1024 characters.", skill_file))
        lowered = description.lower()
        if "use when" not in lowered and "use this" not in lowered:
            issues.append(_issue("warning", "description-trigger", "Description should state when the skill should be used, commonly with a 'Use when' clause.", skill_file))
        if len(description) < 40:
            issues.append(_issue("warning", "description-specificity", "Description is unusually short and may route poorly.", skill_file))

    if compatibility and len(compatibility) > 500:
        issues.append(_issue("error", "compatibility-length", "Compatibility exceeds 500 characters.", skill_file))
    if not body.strip():
        issues.append(_issue("error", "empty-body", "SKILL.md has no instruction body after frontmatter.", skill_file))

    line_count = len(skill_file.read_text(encoding="utf-8").splitlines())
    if line_count > 500:
        issues.append(_issue("warning", "skill-length", "SKILL.md has {0} lines; the specification recommends keeping it under 500.".format(line_count), skill_file))

    for key in data:
        if key not in KNOWN_TOP_LEVEL_FIELDS:
            issues.append(_issue("warning", "unknown-frontmatter-field", "Unknown top-level frontmatter field '{0}'; confirm the target host supports it.".format(key), skill_file))

    if any("\t" in raw for raw in raw_lines):
        issues.append(_issue("warning", "frontmatter-tab", "Frontmatter contains a tab; YAML indentation should use spaces.", skill_file))

    for relative in _candidate_local_references(body):
        candidate = (root / relative).resolve()
        try:
            candidate.relative_to(root.resolve())
        except ValueError:
            issues.append(_issue("error", "reference-escape", "Local reference escapes the skill root: {0}".format(relative), skill_file))
            continue
        if not candidate.exists():
            issues.append(_issue("error", "broken-reference", "Referenced local path does not exist: {0}".format(relative), skill_file))

    openai_yaml = root / "agents" / "openai.yaml"
    if openai_yaml.exists():
        if not openai_yaml.is_file():
            issues.append(_issue("error", "openai-metadata-type", "agents/openai.yaml is not a regular file.", openai_yaml))
        else:
            try:
                metadata_text = openai_yaml.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                issues.append(_issue("error", "openai-metadata-encoding", "agents/openai.yaml must be UTF-8.", openai_yaml))
            else:
                if "\t" in metadata_text:
                    issues.append(_issue("warning", "openai-metadata-tab", "agents/openai.yaml contains tabs; use spaces.", openai_yaml))
                if "interface:" not in metadata_text:
                    issues.append(_issue("warning", "openai-interface-missing", "agents/openai.yaml does not define an interface section.", openai_yaml))

    scripts_dir = root / "scripts"
    if scripts_dir.is_dir():
        for script in sorted(scripts_dir.glob("*.py")):
            try:
                compile(script.read_text(encoding="utf-8"), str(script), "exec")
            except (SyntaxError, UnicodeDecodeError) as exc:
                issues.append(_issue("error", "python-script-invalid", "Python script cannot compile: {0}".format(exc), script))

    forbidden_names = {".env", "id_rsa", "id_ed25519", "credentials.json"}
    for path in root.rglob("*"):
        if path.is_file() and path.name in forbidden_names:
            issues.append(_issue("error", "sensitive-file", "Potential credential or secret file must not be bundled: {0}".format(path.name), path))
        if path.is_file() and path.suffix in {".pyc", ".pyo"}:
            issues.append(_issue("warning", "generated-file", "Generated Python bytecode should not be packaged.", path))

    return issues


def extract_metadata_value(raw_lines: List[str], key: str) -> Optional[str]:
    """Read a scalar one indentation level below `metadata:`."""
    in_metadata = False
    for line in raw_lines:
        if line.startswith("metadata:"):
            in_metadata = True
            continue
        if in_metadata and line and not line[:1].isspace():
            break
        if in_metadata:
            match = re.match(r"^[ \t]+{0}:[ \t]*(.*)$".format(re.escape(key)), line)
            if match:
                return _decode_scalar(match.group(1))
    return None
