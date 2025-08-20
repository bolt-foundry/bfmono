# Phase 4: Sample Display

## Objective

Ensure samples are properly flowing from the backend and displayed in the UI,
allowing users to view and interact with the actual telemetry data.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration with real data
- ✅ Phase 3 complete: UI/UX implementation with PromptGrade

## Current State

- ✅ Samples are created in backend when telemetry is received
- ✅ GraphQL can query samples via deck relationships
- ❌ Samples not yet displayed in the UI
- ❌ Sample detail view not implemented
- ❌ Sample navigation/pagination not built

## Implementation Tasks

### 1. Display Samples in Deck View

**Goal**: Show all samples associated with a deck

- [ ] Query samples via Isograph in deck detail view
- [ ] Create sample list component
- [ ] Display sample metadata (timestamp, status, etc.)
- [ ] Show sample completion data
- [ ] Implement sample count indicators

### 2. Create Sample Detail View

**Goal**: Allow viewing individual sample details

- [ ] Create route for sample detail
      (`/pg/grade/decks/:deckId/samples/:sampleId`)
- [ ] Build sample detail component
- [ ] Display full completion data
- [ ] Show input/output pairs
- [ ] Include metadata and timestamps

### 3. Implement Sample Navigation

**Goal**: Easy navigation between samples

- [ ] Add pagination for large sample lists
- [ ] Implement filtering (by status, date, etc.)
- [ ] Add sorting options
- [ ] Create keyboard shortcuts for navigation
- [ ] Include breadcrumb navigation

### 4. Display Sample Content

**Goal**: Properly render sample data

- [ ] Format JSON completion data for readability
- [ ] Syntax highlighting for code samples
- [ ] Collapsible sections for long content
- [ ] Copy-to-clipboard functionality
- [ ] Diff view for comparisons (if applicable)

### 5. Connect to Real-Time Updates

**Goal**: Show new samples as they arrive

- [ ] Implement real-time sample updates
- [ ] Add loading states while fetching
- [ ] Show notifications for new samples
- [ ] Update counts dynamically
- [ ] Handle error states gracefully

## Technical Considerations

- Use Isograph for all data fetching
- Maintain consistency with Phase 3 UI components
- Ensure performance with large sample sets
- Consider virtualization for long lists
- Keep authentication context

## Success Criteria

- [ ] Can view all samples for a deck
- [ ] Can navigate to individual sample details
- [ ] Sample data is properly formatted and readable
- [ ] Pagination/filtering works for large datasets
- [ ] Real-time updates when new samples arrive
- [ ] Performance remains good with many samples

## Next Phase

Once samples are properly displayed, proceed to
[Phase 5: Feedback Loop](./phase-5-feedback-loop.md)
