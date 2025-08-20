# Implementation Planning

Implementation plans are temporary guides that provide just enough structure to
keep development on track. They start simple and evolve with technical
discoveries, eventually serving as source material for user-facing documentation
when the work is complete.

## Purpose

Implementation plans serve as the source of truth during development, helping
developers (human or AI) verify they're:

- Building the right components
- Following the right patterns
- Meeting technical requirements
- Fulfilling the original goals
- Working on appropriately-sized units

## Structure

### Overview

Start with 1-2 paragraphs explaining what this work delivers and why it matters.
Keep it conceptual and focused on outcomes.

### Goals

| Goal         | Description        | Success Criteria        |
| ------------ | ------------------ | ----------------------- |
| [Clear goal] | [Why this matters] | [How we know it's done] |

### Anti-Goals

| Anti-Goal              | Reason                    |
| ---------------------- | ------------------------- |
| [What we're NOT doing] | [Why we're avoiding this] |

### Technical Approach

Write prose explaining the conceptual approach, key decisions, and architectural
patterns. This should give readers the "why" behind technical choices.

### Components

| Status | Component        | Purpose        |
| ------ | ---------------- | -------------- |
| [ ]    | [Component name] | [What it does] |

### Technical Decisions

| Decision          | Reasoning           | Alternatives Considered |
| ----------------- | ------------------- | ----------------------- |
| [What we decided] | [Why this approach] | [What we didn't choose] |

### Next Steps

| Question               | How to Explore           |
| ---------------------- | ------------------------ |
| [What needs answering] | [How to find the answer] |

## Best Practices

### Do:

- Start with a rough draft outlining basic goals
- Update continuously as you make discoveries
- Focus on the next question to answer, not all questions
- Use tables for concrete trackable items
- Keep prose sections conceptual and high-level
- Include both goals and anti-goals for clarity
- Let tests and scaffolding inform plan updates
- Plan for test-driven development - consider testability early

### Don't:

- Try to answer every question upfront
- Create documentation for documentation's sake
- Make the plan so detailed it becomes rigid
- Keep plans around after work completion
- Separate planning from doing

## Evolution Cycle

1. **Initial Draft**: Basic goals and approach
2. **Test Creation**: Implementation plan guides test writing (following TDD
   workflow)
3. **Scaffolding**: Create minimal structure based on plan
4. **Discovery**: Update plan with technical findings
5. **Iteration**: Repeat steps 2-4 until complete
6. **Archive**: Mine for user-facing documentation

The test creation and scaffolding phases follow our Test-Driven Development
workflow - see [testing.card.md](./testing.card.md) for detailed TDD practices.

## Completion

An implementation plan is ready to be archived when:

- All goals have been achieved
- Tests are passing
- Technical decisions are documented
- The work is ready to ship

At this point, the implementation plan becomes source material for creating
user-facing documentation, changelogs, and other public artifacts.
