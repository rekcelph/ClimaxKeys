# Authoring guide

## Start from a behavior contract

Write one sentence for each item:

- **Job:** What result does the skill own?
- **Trigger:** What would a user naturally ask?
- **Exclusion:** What nearby job belongs elsewhere?
- **Input:** What data, files, or context does it require?
- **Output:** What artifact or change proves completion?
- **Boundary:** What must it never do without confirmation?

If these sentences describe several unrelated outcomes, split the capability into more than one skill.

## Skill architecture decision

### Instruction-only

Use when the host can perform the work with normal reasoning and existing tools. Examples include review checklists, writing conventions, and repository procedures.

### Instructions plus references

Use when the workflow depends on substantial static knowledge, exact templates, schemas, examples, or product-specific notes. Keep each reference focused and load it only when its topic applies.

### Instructions plus scripts

Use when correctness benefits from deterministic parsing, generation, validation, transformation, or repeatable command execution. Keep judgment in the instructions and mechanical work in scripts.

### Instructions plus assets

Use for files copied or transformed into deliverables, such as templates, boilerplate, schemas, or images. An asset should be consumed, not merely read as prose.

## Description design

A description is a router contract. Include:

1. Strong verb and owned object.
2. Common synonyms or artifacts.
3. A natural trigger clause beginning with “Use when”.
4. A negative boundary when confusion is likely.

Example:

```yaml
description: Reviews pull-request changes for correctness, regressions, security issues, and missing tests. Use when the user asks to review a PR, diff, patch, or proposed code change. Do not use for implementing already-approved review fixes.
```

Avoid descriptions that merely say “helps with,” list a department, or repeat the skill name.

## Instruction design

Prefer concrete verbs:

- Inspect
- Compare
- Validate
- Create
- Run
- Verify
- Report

Make decision rules observable. Replace “be careful” with the actual check, fallback, or confirmation boundary.

A robust sequence is:

1. Inspect context.
2. Establish scope.
3. Plan the smallest coherent change.
4. Execute.
5. Verify with independent evidence.
6. Report outputs and limitations.

## Tool behavior

Do not invent tools or command syntax. When a workflow can run in multiple hosts, describe the capability first and list host-specific commands in a compatibility reference.

When a tool is optional, define the fallback. Example: use the repository search tool when available; otherwise use a local text search command.

## File organization

Keep the most important instructions in `SKILL.md`. Move these out when they become large:

- Exact schemas.
- Long examples.
- API references.
- Platform matrices.
- Troubleshooting catalogs.
- Evaluation corpora.

Avoid a “miscellaneous” reference. Focused filenames improve selective loading.

## Mutating workflows

For file edits or external side effects:

- Inspect before write.
- Preserve unrelated changes.
- Use dry runs where practical.
- Avoid overwrite by default.
- Define the approval boundary.
- Verify the resulting state, not only command exit status.

## Final quality questions

- Could a different agent follow the procedure without guessing?
- Does the description route the right paraphrases?
- Are failure cases and unavailable tools handled?
- Does each optional file have a reason to exist?
- Are safety boundaries specific?
- Is verification independent of the change itself?
- Is every host-specific claim tested or clearly labeled?
