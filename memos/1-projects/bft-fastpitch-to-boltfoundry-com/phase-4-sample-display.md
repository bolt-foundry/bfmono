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

**Tasks**:

- [ ] Query samples via Isograph in deck detail view
- [ ] Create sample list component
- [ ] Display sample metadata (timestamp, status, etc.)
- [ ] Show sample completion data
- [ ] Implement sample count indicators
- [ ] Add E2E test verifying samples appear

**Success Criteria**:

- Samples load when viewing a deck
- Sample metadata displays correctly
- Count matches actual number of samples
- E2E test confirms samples visible
- Loading states handled properly

### 2. Create Sample Detail View

**Goal**: Allow viewing individual sample details

**Tasks**:

- [ ] Create route for sample detail
      (`/pg/grade/decks/:deckId/samples/:sampleId`)
- [ ] Build sample detail component
- [ ] Display full completion data
- [ ] Show input/output pairs
- [ ] Include metadata and timestamps
- [ ] Add E2E test for sample detail navigation

**Success Criteria**:

- Can navigate to individual sample
- All sample data displays correctly
- JSON data properly formatted
- E2E test verifies detail view works
- Back navigation returns to deck view

### 3. Implement Sample Navigation

**Goal**: Easy navigation between samples

**Tasks**:

- [ ] Add pagination for large sample lists
- [ ] Implement filtering (by status, date, etc.)
- [ ] Add sorting options
- [ ] Create keyboard shortcuts for navigation
- [ ] Include breadcrumb navigation
- [ ] Add E2E test for pagination and filtering

**Success Criteria**:

- Pagination works for >10 samples
- Filters correctly narrow results
- Sorting changes order as expected
- Keyboard shortcuts functional
- E2E test verifies navigation features

### 4. Display Sample Content

**Goal**: Properly render sample data

**Tasks**:

- [ ] Format JSON completion data for readability
- [ ] Syntax highlighting for code samples
- [ ] Collapsible sections for long content
- [ ] Copy-to-clipboard functionality
- [ ] Diff view for comparisons (if applicable)
- [ ] Add E2E test for content interactions

**Success Criteria**:

- JSON displays with proper indentation
- Code samples have syntax highlighting
- Long content can be collapsed/expanded
- Copy button works correctly
- E2E test verifies all interactions

### 5. Connect to Real-Time Updates

**Goal**: Show new samples as they arrive

**Tasks**:

- [ ] Implement real-time sample updates
- [ ] Add loading states while fetching
- [ ] Show notifications for new samples
- [ ] Update counts dynamically
- [ ] Handle error states gracefully
- [ ] Add E2E test for real-time updates

**Success Criteria**:

- New samples appear without refresh
- Loading states display during fetch
- Notifications appear for new samples
- Counts update automatically
- E2E test verifies real-time behavior
- Errors display user-friendly messages

## Technical Considerations

- Use Isograph for all data fetching
- Maintain consistency with Phase 3 UI components
- Ensure performance with large sample sets
- Consider virtualization for long lists
- Keep authentication context

## Overall Phase Success Criteria

- [ ] Can view all samples for a deck
- [ ] Can navigate to individual sample details
- [ ] Sample data is properly formatted and readable
- [ ] Pagination/filtering works for large datasets
- [ ] Real-time updates when new samples arrive
- [ ] All E2E tests pass
- [ ] No regression from Phase 3 UI changes
- [ ] Follows Isograph component patterns
- [ ] Accessibility standards met (keyboard nav, screen readers)

## Next Phase

Once samples are properly displayed, proceed to
[Phase 5: Feedback Loop](./phase-5-feedback-loop.md)
