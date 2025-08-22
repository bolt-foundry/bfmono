# Open Questions

Questions we need to answer as we build the integration.

## Phase 1: Telemetry Visibility

_Most Phase 1 questions have been answered - see answered-questions.md_

- How should we handle the Isograph query for deck samples?
  - **Need to determine:** Exact fields needed from BfSample for GradingSample\
    type
  - **Need to determine:** Whether to use @loadable or eager loading

## Phase 2: Dashboard Integration

_Most Phase 2 questions have been answered - see answered-questions.md_

- What details are most important to show for each sample?

## Phase 3: UI/UX Implementation

_All Phase 3 questions have been answered - see answered-questions.md_

## Phase 4: Sample Display

\_All Phase 4 questions have been answered - see phase-4-sample-display.md\_\
_answered questions section_

## Backend Phase: Node Query Pattern

**NOTE: Many questions resolved - see answered-questions.md "Backend Phase:**\
**Node**\
**Query Pattern - RESOLVED QUESTIONS"**

### Implementation Requirements (Based on Research)

**RESOLVED: Node Interface Implementation Status**

- BfDeck/BfSample use BfNode interface, NOT standard Node interface
- No `node(id: ID!): Node` query exists in Query root
- No `asBfDeck`/`asBfSample` type casting operations exist
- **Required work:** Full Node pattern implementation from scratch

**RESOLVED: Parameter Passing & Loading**

- Use `props.parameters` for entrypoints, `useRouter()` for components
- Isograph uses React Suspense for loading states automatically
- Global store caching with fragment-level deduplication established

**RESOLVED: Error Handling & Migration**

- Use `BfDsEmptyState` for user-friendly error states
- Environment-based feature flags + hook-based migration patterns available
- Query complexity concerns are low given current architecture

### Remaining Implementation Questions

**Backend Implementation Priority:**

- What's the global ID encoding scheme? Use Relay-style base64 encoding or\
  simpler approach?
- Should `bfNode(id: ID!)` return a union type or use the interface resolution?

**Optimistic Updates Strategy:**

- Should we implement optimistic updates for real-time data? (Research found no\
  current patterns)
- How do we handle optimistic update conflicts with the global cache?
- What operations should support optimistic updates vs. requiring full refetch?

**Route Batching Optimization:**

- Should we batch multiple node queries for routes like\
  `/decks/:deckId/samples/:sampleId`?
- Current research shows lazy loading works well, but complex routes might\
  benefit from batching
- How do we balance developer experience vs. performance for nested routes?

**Error Boundary Strategy:**

- What's the pattern for error boundaries with Isograph components? (Research\
  found limited error boundary usage)
- Should 404s be handled at router level or component level? (Current: mix of\
  both approaches)
- How do we provide consistent error experiences across the Node pattern?

**E2E Test Transition:**

- Can we incrementally migrate while keeping existing E2E tests working?\
  (Research shows flexible test patterns)
- How do we handle E2E tests during the transition period where some routes use\
  props and others use Node queries?
- Should we create separate test suites for Node pattern routes?

### Next Research Priorities

**1\. Relay Global ID Investigation:**

- Research Relay global ID encoding patterns in similar codebases
- Investigate if other GraphQL Node implementations in the ecosystem use base64\
  vs. simple IDs
- Test performance implications of global ID encoding/decoding

**2\. Isograph Optimistic Updates Research:**

- Check Isograph documentation for optimistic update capabilities
- Look for examples in open source Isograph projects
- Test feasibility with current store architecture

**3\. Error Boundary Best Practices:**

- Research React error boundary patterns for GraphQL applications
- Look for Isograph-specific error handling recommendations
- Test error boundary integration with current routing

## Phase 5: Feedback Loop

_Most Phase 5 questions have been resolved - see answered-questions.md "Phase 5:
Feedback Loop - RESOLVED QUESTIONS" section_

### Rating Interface Design (REMAINING QUESTIONS)

**Q:** Should ratings be tied to specific aspects of outputs or overall
quality?\
**Best Guess:** **Support both patterns** - The current system uses deck-based
multi-dimensional evaluation (helpfulness, accuracy, professionalism graders)
with overall -3 to +3 scores per dimension. This works well. Consider adding
composite scoring that combines aspect ratings into overall quality scores for
simpler UI workflows.

**Q:** How granular should feedback be (overall sample vs individual output
components)?\
**Best Guess:** **Overall sample rating with optional component breakdown** -
The current BfSample stores complete request/response pairs as atomic units.
Rating at the sample level aligns with existing patterns. For Fastpitch
specifically, consider rating the overall story selection quality while
optionally allowing feedback on individual story choices within the JSON output.

### Feedback Storage & Retrieval (REMAINING QUESTIONS)

**Q:** What permissions/access controls are needed for viewing feedback?\
**Best Guess:** **Extend existing organization-based access control** - Current
system uses organization-scoped data isolation. For feedback viewing, add
role-based permissions (viewer, analyst, admin) and consider privacy levels for
sensitive samples. The existing CurrentViewer system provides a foundation for
role-based access.

### Feedback Influence on Future Runs (REMAINING QUESTIONS)

**Q:** How do we translate feedback into actionable improvements for Fastpitch?\
**Best Guess:** **Context injection approach** - Modify deck rendering to
include feedback-derived context. Query highly-rated examples (score ≥ 2) as
positive examples and poorly-rated ones (score ≤ -2) as negative examples.
Inject these into the fastpitch-curator.deck.md prompt context. This leverages
the existing deck system architecture.

**Q:** What's the mechanism for feeding rating data back into the generation
process?\
**Best Guess:** **Enhanced deck context system** - Extend the existing context
variable injection in fastpitch.bft.ts (lines 90-97) to include
`positiveExamples`, `negativeExamples`, and `feedbackTrends` variables populated
from BfGraderResult queries. This uses existing infrastructure while adding
feedback-driven learning.

**Q:** Should feedback influence prompt engineering, model selection, or
post-processing?\
**Best Guess:** **Start with prompt engineering, expand to model selection** -
Prompt engineering is most actionable with existing infrastructure (deck system
supports dynamic context). Model selection could use feedback quality scores to
choose between models (high-stakes vs routine tasks). Post-processing offers
least immediate value for current use cases.

**Q:** How do we handle conflicting feedback from multiple raters?\
**Best Guess:** **Use statistical aggregation with disagreement tracking** - The
existing system already tracks agreement rates and supports multiple raters.
Implement mean/median scoring for aggregation, flag high-variance ratings for
review, and use the existing BfGraderResult pattern to store individual opinions
while computing consensus scores.

### Quality Measurement (REMAINING QUESTIONS)

**Q:** How do we measure if feedback is actually improving outputs?\
**Best Guess:** **Before/after comparison using existing metrics** - Use the
AIBFF calibration system's average distance calculations to measure improvement.
Compare average scores before and after feedback integration, track agreement
rates between human feedback and new outputs, and monitor cost-effectiveness
metrics (existing token usage tracking).

**Q:** What metrics should we track to validate the feedback loop
effectiveness?\
**Best Guess:** **Extend existing measurement patterns** - Track average
feedback scores over time, measure human-AI agreement rates, monitor cost per
quality unit (tokens/score), and add feedback velocity metrics (time to provide
feedback). Leverage existing telemetry infrastructure and PostHog analytics
integration.

**Q:** How do we establish baselines before and after feedback integration?\
**Best Guess:** **Use existing sample collection and evaluation patterns** - Run
baseline evaluations using current fastpitch outputs before implementing
feedback loop, store results as BfGraderResult entities, then compare
post-feedback outputs using identical evaluation criteria. The existing
calibrate.ts system provides the evaluation framework.

**Q:** What timeframes are reasonable for seeing improvement?\
**Best Guess:** **2-4 weeks for initial signals, 2+ months for significant
impact** - Based on existing telemetry patterns and team measurement approach.
Initial feedback effects (1-2 weeks) should show in individual sample ratings,
statistical significance (4-8 weeks) requires adequate sample sizes, and
system-wide improvements (2+ months) need multiple feedback integration cycles.

## Phase 6: Polish & Scale

- How do we prepare this for eventual customer use?
