# Example Tone Grader

This is an example grader deck using the postfix embed syntax to demonstrate how
user criteria come first, followed by the grader framework.

## Tone Evaluation

![tone grader context](./example-tone-grader.deck.toml#contexts)

### Main Criteria

- Evaluate whether the response is concise without being curt
- Consider the balance between brevity and helpfulness
- Assess if the tone is appropriate for the context

### Scoring Guidelines

- Score 3: Perfectly concise while remaining helpful and warm [^perfect-concise]
- Score 2: Good balance with minor improvements possible [^good-balance]
- Score 1: Slightly too verbose or slightly too terse
- Score 0: Neutral - acceptable but not optimal
- Score -1: Noticeably too verbose or curt
- Score -2: Significantly problematic tone [^too-verbose]
- Score -3: Extremely verbose or rudely brief [^too-curt]

[^perfect-concise]: ![](./example-tone-grader.deck.toml#samples.perfect-concise)

[^good-balance]: ![](./example-tone-grader.deck.toml#samples.good-balance)

[^too-verbose]: ![](./example-tone-grader.deck.toml#samples.too-verbose)

[^too-curt]: ![](./example-tone-grader.deck.toml#samples.too-curt)

> ![grader evaluation framework](./grader-base.deck.md#grader-evaluation)
