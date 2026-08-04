# Evaluation guide

Evaluate routing separately from execution.

## Test case format

Use a small table or JSON file with these fields:

| Field | Meaning |
|---|---|
| `id` | Stable test identifier. |
| `prompt` | User request as naturally phrased. |
| `should_trigger` | Whether implicit routing should select the skill. |
| `expected_behavior` | Observable actions or output. |
| `forbidden_behavior` | Important failure to catch. |
| `setup` | Files, repository state, or tools required. |

## Routing suite

Include at least:

- Direct wording from the description.
- Common paraphrases.
- Artifact-based wording, such as mentioning `SKILL.md` instead of “skill.”
- Near-miss requests from adjacent domains.
- Very broad prompts that should not activate a specialized skill.
- Explicit invocation with incomplete details.

A useful balance is three to five positive and three to five negative prompts.

## Behavioral suite

Test:

1. Normal success.
2. Existing-file update rather than greenfield creation.
3. Missing minor information that can be inferred.
4. Missing critical information that requires a question or placeholder.
5. Tool or dependency unavailable.
6. Invalid input.
7. Existing unrelated changes.
8. Safety-sensitive mutation.

## Scoring

### Routing

- **2:** Correct activation decision with no material ambiguity.
- **1:** Correct only under explicit invocation or description needs tuning.
- **0:** Wrong activation decision.

### Execution

- **2:** Correct output, verification, and boundary handling.
- **1:** Useful output with a material omission.
- **0:** Incorrect, unsafe, or unverifiable result.

Record concrete failures rather than only a total score.

## Manual host test

For each claimed host:

1. Install in the documented location.
2. Restart or reopen if needed.
3. Confirm the skill appears in the host's skill list.
4. Run one explicit invocation.
5. Run at least two implicit positive prompts.
6. Run at least two negative prompts.
7. Exercise one helper script through the agent.
8. Record host version, date, and observed differences.

Do not convert a successful local script test into a claim of successful host routing.

## Regression practice

Keep failed prompts as permanent cases. When changing the description, re-run the full routing set because improving one trigger can create false positives elsewhere.
