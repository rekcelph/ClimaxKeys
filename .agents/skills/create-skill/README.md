# Create Skill for Antigravity and Codex

A portable Agent Skill for creating, auditing, validating, installing, and packaging other Agent Skills.

## Install

Repository scope, shared by Antigravity and Codex:

```bash
python scripts/install_skill.py . --target both --scope repo --repo /path/to/repository
```

User scope:

```bash
python scripts/install_skill.py . --target both --scope user
```

The user-scoped destinations differ:

- Antigravity: `~/.gemini/config/skills/create-skill`
- Codex: `~/.agents/skills/create-skill`

## Validate

```bash
python scripts/validate_skill.py .
```

## Create a new skill

```bash
python scripts/init_skill.py \
  --name my-skill \
  --description "Does ... Use when ..." \
  --output /path/to/.agents/skills \
  --profile standard
```

## Package

```bash
python scripts/package_skill.py . --output ./dist
```

## Requirements

Python 3.9 or newer. No third-party Python packages are required.

## Sources checked

The package was aligned on 2026-08-02 with:

- Open Agent Skills specification: https://agentskills.io/specification
- Codex skill documentation: https://learn.chatgpt.com/docs/build-skills
- Google Antigravity skill codelab: https://codelabs.developers.google.com/getting-started-with-antigravity-skills

Host behavior can evolve; verify current documentation when installation or metadata behavior is critical.
