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

- How do we measure if feedback is actually improving outputs?

## Phase 6: Polish & Scale

- How do we prepare this for eventual customer use?
