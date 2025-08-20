# Team Summary Analysis Grader

This grader evaluates team member work summaries to ensure they focus on impact
rather than activity counts, using plain language and meaningful context.

## Summary Quality Evaluation

![team summary grader contexts](./team-summary-analysis-grader.deck.toml#contexts)

### Main Criteria

- Evaluate whether the summary focuses on meaning over metrics
- Assess if the language is plain and accessible (not jargony)
- Consider if the work is connected to company goals when appropriate
- Check if the summary tells a clear story of what was accomplished

### Scoring Guidelines

- Score 3: Perfect impact-focused summary with clear storytelling [^excellent-summary]
- Score 2: Good summary with minor improvements possible [^good-summary]
- Score 1: Adequate but could better emphasize impact over activity
- Score 0: Neutral - acceptable but neither particularly good nor bad
- Score -1: Too focused on metrics or lacks clear impact description
- Score -2: Significantly problematic - too mechanical or jargony [^poor-summary]
- Score -3: Extremely poor - just lists activities without meaning [^terrible-summary]

[^excellent-summary]: ![sample](./team-summary-analysis-grader.deck.toml#samples.excellent-summary)

[^good-summary]: ![sample](./team-summary-analysis-grader.deck.toml#samples.good-summary)

[^poor-summary]: ![sample](./team-summary-analysis-grader.deck.toml#samples.poor-summary)

[^terrible-summary]: ![sample](./team-summary-analysis-grader.deck.toml#samples.terrible-summary)

> ![grader evaluation framework](../grader-base.deck.md)
