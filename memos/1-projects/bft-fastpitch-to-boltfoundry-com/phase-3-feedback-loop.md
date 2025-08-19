# Phase 3: Feedback Loop Foundation

## Objective

Enable our team to provide feedback on Fastpitch outputs and use that feedback
to improve future generations.

## Prerequisites

- Phase 1 complete: Telemetry visible
- Phase 2 complete: Dashboard integration

## Key Implementation Decision

**Unified Grading Structure:** Create a unified grading system where:

- BfGrader entity represents automatic graders
- BfGraderResult stores all grading results (both automatic and manual)
- The grader field in BfGraderResult references either a BfGrader (automatic) or
  a person (manual)
- This replaces the current separate BfGraderResult/BfSampleFeedback structure

## Success Criteria

- [ ] Can rate Fastpitch outputs
- [ ] Feedback is stored and retrievable
- [ ] Can see feedback history
- [ ] Feedback influences future Fastpitch runs
- [ ] Clear improvement in output quality

## Next Phase

Once feedback loop works, proceed to
[Phase 4: Iteration & Polish](./phase-4-iteration-polish.md)
