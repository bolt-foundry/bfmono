# Phase 4: Sample Display

## Objective

Ensure samples are properly flowing from the backend and displayed in the UI,  
allowing users to view and interact with the actual telemetry data.

## Prerequisites

*   ✅ Phase 1 complete: Telemetry visible
*   ✅ Phase 2 complete: Dashboard integration with real data
*   ✅ Phase 3 complete: UI/UX implementation with PromptGrade
*   ⏳ **Backend work needed**: Implement `bfNode(id: ID!): BfNode` query pattern  
    (see [backend-node-query-pattern.md](./backend-node-query-pattern.md))

## Current State

*   ✅ **Telemetry ingestion creates real samples**: Updated handler to use  
    `deck.recordSample(telemetryData)`
*   ✅ **Complete telemetry data pipeline**: telemetryData field stores full  
    OpenAI request/response
*   ✅ **JSON scalar serialization fixed**: GraphQL/Isograph compatibility  
    resolved
*   ✅ **Real sample display working**: SampleListItem component parses and  
    displays telemetry data
*   ✅ **All E2E tests passing**: fastpitch-telemetry test validates full pipeline
*   ✅ **Framework issues documented**: BfNode tech debt tracked with workarounds
*   ✅ **Type system compatibility**: completionData → telemetryData migration  
    complete
*   ✅ **Sample list display functional**: Shows samples with metadata, completion  
    preview, token usage
*   ⏳ **Sample detail view**: Basic list display works, detail view needs  
    implementation
*   ⏳ **Sample navigation/pagination**: Currently loads first 100 samples,  
    pagination needed

## Answered Questions

**Q: Should we integrate with real GraphQL BfSample backend via Isograph, or**  
**continue with mock data approach?** A: Use real GraphQL BfSample backend.  
Phase  
4 documentation explicitly requires Isograph integration, existing  
infrastructure is ready, and the mock hooks were designed as temporary  
scaffolding.

**Q: Should we uncomment and implement route entries for**  
**/pg/grade/decks/:deckId/samples/:sampleId?** A: No, continue with  
single-component architecture in Grade component. This provides better state  
management and is consistent with current patterns. Extend Grade component to  
handle URL parameter parsing instead.

**Q: Should we reuse existing components/Evals/Grading/SampleDisplay.tsx or**  
**create new ones for PromptGrade interface?** A: Reuse existing  
SampleDisplay.tsx  
component. It's perfectly suited for PromptGrade interface - same architecture,  
design patterns, data structures, and styling. Only minor context integration  
needed.

**Q: Should sample list display go in MainContent area of PromptGrade layout**  
**when viewing a deck?** A: Yes, MainContent area via existing DeckDetailView  
tabbed interface. Current implementation is correct - provides maximum screen  
real estate and follows established patterns.

## Implementation Tasks

### 1\. Display Samples in Deck View ✅ COMPLETED

**Goal**: Show all samples associated with a deck

**Tasks**:

*   ✅ Query samples via Isograph in deck detail view
*   ✅ Create sample list component (DeckSamplesList)
*   ✅ Create sample item component (SampleListItem) with metadata display  
    capability
*   ✅ **Show sample completion data preview**: Component displays response  
    content, token usage
*   ✅ **Telemetry data integration**: Parse telemetryData to extract completion  
    info
*   ✅ **Handle JSON scalar serialization**: Fixed GraphQL/Isograph compatibility
*   ✅ **Real sample creation**: Updated telemetry handler to create actual  
    samples
*   ✅ Implement empty state for decks with no samples
*   ✅ Enhanced fastpitch E2E test to verify sample flow and deck navigation

**Success Criteria**:

*   ✅ Samples load when viewing a deck (real samples display correctly)
*   ✅ **Sample metadata displays correctly**: Shows name, collection method,  
    token counts
*   ✅ **Completion data preview working**: Displays response content with  
    truncation
*   ✅ Count matches actual number of samples (displays real count from database)
*   ✅ **E2E test confirms samples visible**: fastpitch-telemetry creates and  
    displays real samples
*   ✅ Loading states handled properly via Isograph
*   ✅ **Framework workarounds documented**: BfNode technical debt tracked

### 2\. Create Sample Detail View

**Goal**: Allow viewing individual sample details

**Tasks**:

*   Create route for sample detail  
    (`/pg/grade/decks/:deckId/samples/:sampleId`)
*   Build sample detail component
*   Display full completion data
*   Show input/output pairs
*   Include metadata and timestamps
*   Add E2E test for sample detail navigation

**Success Criteria**:

*   Can navigate to individual sample
*   All sample data displays correctly
*   JSON data properly formatted
*   E2E test verifies detail view works
*   Back navigation returns to deck view

### 3\. Implement Sample Navigation

**Goal**: Easy navigation between samples

**Tasks**:

*   Add pagination for large sample lists
*   Implement filtering (by status, date, etc.)
*   Add sorting options
*   Create keyboard shortcuts for navigation
*   Include breadcrumb navigation
*   Add E2E test for pagination and filtering

**Success Criteria**:

*   Pagination works for >10 samples
*   Filters correctly narrow results
*   Sorting changes order as expected
*   Keyboard shortcuts functional
*   E2E test verifies navigation features

### 4\. Display Sample Content

**Goal**: Properly render sample data

**Tasks**:

*   Format JSON completion data for readability
*   Syntax highlighting for code samples
*   Collapsible sections for long content
*   Copy-to-clipboard functionality
*   Diff view for comparisons (if applicable)
*   Add E2E test for content interactions

**Success Criteria**:

*   JSON displays with proper indentation
*   Code samples have syntax highlighting
*   Long content can be collapsed/expanded
*   Copy button works correctly
*   E2E test verifies all interactions

### 5\. Connect to Real-Time Updates

**Goal**: Show new samples as they arrive

**Tasks**:

*   Implement real-time sample updates
*   Add loading states while fetching
*   Show notifications for new samples
*   Update counts dynamically
*   Handle error states gracefully
*   Add E2E test for real-time updates

**Success Criteria**:

*   New samples appear without refresh
*   Loading states display during fetch
*   Notifications appear for new samples
*   Counts update automatically
*   E2E test verifies real-time behavior
*   Errors display user-friendly messages

## Technical Considerations

*   Use Isograph for all data fetching
*   Maintain consistency with Phase 3 UI components
*   Ensure performance with large sample sets
*   Consider virtualization for long lists
*   Keep authentication context

## Major Technical Challenges Solved

### 1\. JSON Scalar Serialization Issue ✅ RESOLVED

**Problem**: Isograph normalization error "Unexpected object array when  
normalizing scalar" **Root Cause**: JSON scalar was passing raw objects instead  
of serialized strings to GraphQL **Solution**: Updated JSON scalar  
serialize/parseValue functions to use `JSON.stringify`/`JSON.parse` **Files**:  
`apps/bfDb/graphql/schemaConfigPothosSimple.ts`

### 2\. BfNode Relationship Methods Typing ✅ DOCUMENTED

**Problem**: TypeScript error "Property 'createSamplesItem' does not exist on  
type 'BfDeck'" **Root Cause**: Relationship methods are generated at runtime,  
not available at compile time **Solution**: Parameter typing workaround:  
`this: WithRelationships<typeof BfDeck>` **Files**:  
`apps/bfDb/nodeTypes/rlhf/BfDeck.ts`, documented in  
`memos/3-resources/bfnode-tech-debt/`

### 3\. Data Structure Migration ✅ COMPLETED

**Problem**: Field rename from `completionData` to `telemetryData` across entire  
codebase **Solution**: Systematic migration of GraphQL schema, database fields,  
UI components, and all tests **Impact**: 15+ files updated, all type errors  
resolved, E2E tests passing

### 4\. Telemetry Data Type Compatibility ✅ RESOLVED

**Problem**: `TelemetryData` interface not compatible with `JSONValue` type  
requirement **Solution**: `@ts-expect-error` with documentation links for  
temporary framework workaround **Files**: Framework-level JSON field typing  
issue documented for future resolution

## Overall Phase Success Criteria

*   ✅ **Can view all samples for a deck**: Real samples display with metadata and  
    completion previews
*   ⏳ Can navigate to individual sample details (pending implementation)
*   ✅ **Sample data is properly formatted and readable**: JSON parsed, content  
    truncated, token usage shown
*   ⏳ Pagination/filtering works for large datasets (pending implementation)
*   ⏳ Real-time updates when new samples arrive (pending implementation)
*   ✅ **All E2E tests pass**: fastpitch-telemetry test validates complete  
    pipeline
*   ✅ **No regression from Phase 3 UI changes**: All existing functionality  
    preserved
*   ✅ **Follows Isograph component patterns**: Full GraphQL integration  
    implemented
*   ✅ **Technical debt properly managed**: Framework issues documented with  
    workarounds
*   ✅ **Type system compatibility**: All lint and type check errors resolved

## Next Phase

Once samples are properly displayed, proceed to  
[Phase 5: Feedback Loop](./phase-5-feedback-loop.md)

---

## Open Questions

### Backend Phase Questions

**GraphQL Schema & Node Interface**:

*   Does our current GraphQL schema properly implement the Node interface for  
    BfDeck and BfSample?
*   Do we have the `node(id: ID!): Node` query implemented in the backend?
*   Are the `asBfDeck` and `asBfSample` type casting operations available?

**Parameter Passing**:

*   How should we pass route parameters (like `tab`) to Isograph components?
*   Should we use Isograph component parameters: `DeckDetailView(tab: $tab)`?
*   Or handle routing state within the component using router context?

**Data Loading & Caching**:

*   How does Isograph handle loading states for node queries?
*   What's the caching strategy for frequently accessed entities?
*   Should we implement optimistic updates for real-time data?

**Error Handling**:

*   How should we handle "node not found" vs "node exists but wrong type"?
*   What's the pattern for error boundaries with Isograph components?
*   Should 404s be handled at the router level or component level?

**Migration Strategy**:

*   Can we incrementally migrate while keeping existing E2E tests working?
*   Should we feature-flag the new Node pattern during migration?
*   How do we handle the transition period where some components use props and  
    others use Isograph?

**Performance Considerations**:

*   Are there query complexity concerns with the node pattern?
*   Should we batch multiple node queries for routes like  
    `/decks/:deckId/samples/:sampleId`?
*   What's the impact on bundle size with more Isograph components?

**Note**: See detailed research tasks in  
[open-questions.md](./open-questions.md#backend-phase-node-query-pattern) for  
investigating these backend phase questions.