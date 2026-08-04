# Agent Skills specification summary

This is an operational summary, not a replacement for the current specification.

Source checked 2026-08-02: https://agentskills.io/specification

## Required structure

```text
skill-name/
└── SKILL.md
```

Common optional directories are `scripts/`, `references/`, and `assets/`. Additional files are allowed.

## `SKILL.md`

The file begins with YAML frontmatter and continues with Markdown instructions.

Required fields:

| Field | Rule |
|---|---|
| `name` | 1-64 characters; lowercase ASCII letters, digits, and hyphens; no leading, trailing, or consecutive hyphens; must match the parent directory. |
| `description` | 1-1024 characters; explain what the skill does and when it should be used. |

Optional standard fields:

- `license`: short license name or bundled license reference.
- `compatibility`: 1-500 characters when present; state real environment requirements.
- `metadata`: string-to-string mapping for extra information.
- `allowed-tools`: experimental, space-separated pre-approved tools; host support varies.

## Progressive disclosure

1. Hosts initially index `name` and `description`.
2. They read the full `SKILL.md` after activation.
3. They load referenced resources only when needed.

Keep `SKILL.md` focused, preferably under 500 lines. Split detailed material into small, directly referenced files.

## Files and scripts

Use relative paths from the skill root. Prefer direct references such as:

```text
references/FORMAT.md
scripts/validate.py
```

Scripts should be self-contained, explain dependencies, report useful errors, and handle edge cases.

## Validation

The standard documents the reference validator:

```bash
skills-ref validate ./my-skill
```

The validator bundled with this skill adds practical checks but does not claim full YAML or host-runtime equivalence.
