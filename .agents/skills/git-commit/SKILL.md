---
name: git-commit
description: Creates safe, intentional Git commits from the current repository. Use when the user asks to commit changes, create a checkpoint, prepare a Git commit, stage related work, or write and apply an appropriate commit message.
---

# Git Commit

## Goal

Create a clean, reviewable Git commit that contains only the intended changes, follows the repository's conventions, preserves unrelated work, and leaves the user with a clear verification summary.

## Core principles

- Treat every pre-existing working-tree change as user-owned.
- Never discard, overwrite, reset, restore, clean, or stash changes unless the user explicitly requests it.
- Never push, force-push, amend, rebase, tag, or rewrite history unless explicitly requested.
- Never bypass hooks with `--no-verify` unless explicitly requested.
- Do not add AI attribution, generated-by text, or a co-author trailer unless the user or repository requires it.
- Prefer one focused commit. Split changes only when there are clearly independent, individually valid units.
- Do not create an empty commit unless explicitly requested.

## Workflow

### 1. Locate and understand the repository

1. Confirm that the current directory is inside a Git worktree:

   ```sh
   git rev-parse --show-toplevel
   ```

2. Work from the repository root.
3. Read relevant repository instructions before staging anything. Check files such as:
   - `AGENTS.md`
   - `CONTRIBUTING.md`
   - `README.md`
   - project-specific development or release documentation
4. Inspect the current branch and worktree:

   ```sh
   git status --short --branch
   ```

5. Inspect both unstaged and staged changes:

   ```sh
   git diff --stat
   git diff
   git diff --cached --stat
   git diff --cached
   ```

6. Review recent commit subjects to infer the repository's message style:

   ```sh
   git log -10 --pretty=format:%s
   ```

### 2. Determine commit scope

- Follow the scope explicitly requested by the user.
- Otherwise, include only changes clearly related to the task being committed.
- Do not silently include unrelated modified, deleted, or untracked files.
- Preserve changes that were already staged unless they are clearly outside the requested scope. If existing staged content conflicts with the requested commit and cannot be separated safely, do not commit; explain the conflict.
- Prefer explicit path staging:

  ```sh
  git add -- <path1> <path2>
  ```

- Avoid `git add -A`, `git add .`, and broad globbing unless the complete worktree is intentionally part of the commit and has been reviewed.
- If one file mixes related and unrelated edits, use careful hunk staging only when it can be done reliably. Otherwise, leave the file unstaged and report why.
- For renames or deletions, verify the intended old and new paths before staging them.

### 3. Review for accidental or unsafe content

Before committing, inspect the exact staged patch:

```sh
git diff --cached --stat
git diff --cached
```

Check for:

- credentials, tokens, passwords, private keys, cookies, or connection strings
- `.env` files or local configuration that should remain untracked
- generated build output, caches, logs, editor files, or dependency directories
- unexpectedly large or binary files
- debug statements, temporary instrumentation, or commented-out experiments
- accidental formatting churn or unrelated refactors
- merge-conflict markers

Run Git's whitespace/error check:

```sh
git diff --cached --check
```

If sensitive or clearly accidental content is staged, stop and report it. Do not commit it merely because the user said “commit everything.”

### 4. Validate the change

- Follow validation commands documented by the repository.
- Prefer targeted checks appropriate to the staged change: formatting, linting, type checking, tests, builds, or generated-file verification.
- Do not make unrelated code changes merely to make a check pass.
- If validation changes files, review those changes and stage them only when they belong to the commit.
- If a required check fails, do not create a normal commit. Report the failure unless the user explicitly requested a checkpoint or work-in-progress commit despite known failures.
- Record which checks ran and their outcomes for the final summary.

### 5. Write the commit message

Use this priority order:

1. An exact message supplied by the user.
2. A repository-documented convention.
3. The dominant style in recent history.
4. A concise imperative subject with an optional explanatory body.

Message rules:

- Describe the change, not the act of committing it.
- Keep the subject concise, specific, and in the imperative mood when compatible with repository style.
- Do not end the subject with a period.
- Use a body when the reason, trade-off, migration detail, or non-obvious behavior deserves explanation.
- Wrap body text at a readable width, normally about 72 characters.
- Mention issue IDs only when supplied by the user or already evident from repository context.

When the repository uses Conventional Commits, use:

```text
<type>[optional scope]: <description>
```

Common types include `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `style`, and `revert`. Do not force Conventional Commits onto a repository that uses another established style.

### 6. Create the commit

1. Confirm that the staged diff is non-empty and matches the intended scope:

   ```sh
   git diff --cached --quiet
   ```

   A successful exit means there is nothing staged; do not commit unless an empty commit was explicitly requested.

2. Commit normally so repository hooks run:

   ```sh
   git commit -m "<subject>"
   ```

3. For a multiline message, use multiple `-m` arguments or a temporary message file. Do not place secrets or sensitive data in the message.

4. If the commit fails, preserve the worktree and staged state. Diagnose and report the actual error instead of retrying with destructive flags.

### 7. Verify and report

After a successful commit, run:

```sh
git status --short --branch
git show --stat --oneline --decorate --no-renames HEAD
```

Report:

- the new commit's short hash and subject
- the files or logical scope committed
- validation commands and outcomes
- any remaining staged, modified, deleted, or untracked changes
- whether hooks altered files or left additional work

Do not claim the repository is clean unless `git status` confirms it.

## Special cases

### Checkpoint or WIP commits

Only create a knowingly incomplete or failing commit when the user explicitly asks for a checkpoint/WIP commit. Make the incomplete state clear in the subject or body and report failed or skipped validation.

### Multiple commits

Split into multiple commits only when each commit:

- represents a distinct logical change
- can be reviewed independently
- leaves the repository in an acceptable state
- has its own accurate message

Do not split changes merely to produce an arbitrary number of commits.

### Amend requests

Amend only when explicitly requested. Before amending, inspect the current `HEAD`, verify that it is the intended commit, and warn when it may already have been shared remotely. Never amend someone else's commit silently.

### Merge or rebase state

If a merge, rebase, cherry-pick, or revert is in progress, inspect the state before committing. Do not create an ordinary commit that bypasses or obscures the active Git operation.

## Completion standard

The task is complete only when the intended changes are committed, the resulting commit is verified, validation is reported honestly, unrelated work remains untouched, and no push or history rewrite occurred unless requested.
