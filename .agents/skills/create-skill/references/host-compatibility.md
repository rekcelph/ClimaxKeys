# Antigravity and Codex compatibility

Sources checked 2026-08-02:

- https://learn.chatgpt.com/docs/build-skills
- https://codelabs.developers.google.com/getting-started-with-antigravity-skills
- https://agentskills.io/specification

## Shared authoring format

Both hosts use directory-based Agent Skills with `SKILL.md` and optional support files. Use the open standard as the portable baseline.

Always include both `name` and `description`. Antigravity documentation may allow deriving a missing name from the directory, but the open standard and Codex require it.

## Repository scope

Use:

```text
<repository>/.agents/skills/<skill-name>/
```

This is the best shared installation location.

Codex scans `.agents/skills` from the current working directory upward to the repository root. A skill may therefore be scoped to a nested module or the whole repository.

## User scope

| Host | Location |
|---|---|
| Antigravity | `~/.gemini/config/skills/<skill-name>/` |
| Codex | `~/.agents/skills/<skill-name>/` |

Codex also documents admin skills under `/etc/codex/skills` and bundled system skills. Do not assume an Antigravity equivalent without current documentation.

## Invocation and discovery

Codex CLI or IDE:

- Run `/skills` to inspect skills.
- Mention a skill as `$skill-name` for explicit invocation.
- Codex may invoke it implicitly based on `description`.

Antigravity:

- `/skills` is documented for Antigravity CLI.
- Natural-language requests can trigger skills based on indexed metadata.

Document host syntax for the user, but keep core skill instructions host-neutral.

## `agents/openai.yaml`

Codex and ChatGPT can use this optional file for:

- Display name and description.
- Icons and brand color.
- A default prompt.
- `policy.allow_implicit_invocation`.
- Tool dependencies, including MCP servers.

Other hosts may ignore it. Never place indispensable workflow instructions only in this file.

## Symlinks

Codex documents support for symlinked skill directories. Antigravity documentation used for this package does not promise identical behavior. Prefer copying for cross-host user installation; use symlinks only when the environment is controlled and tested.

## Change detection

Codex documents automatic detection of skill changes, with restart as a fallback. For Antigravity, restart or reopen the workspace when a new skill does not appear.

## Compatibility rule

When a host-specific feature would change the skill's actual behavior, state the dependency in `compatibility`, preserve a portable fallback when possible, and test each claimed host separately.
