# Phase 3: Frontend Grading Flow

## Overview

Navigate back to the eval page in the browser and verify that the samples
created in Phase 2 appear in the grading interface. Test the actual grading
functionality.

## Requirements

- Navigate to /eval page
- Find the test deck in the deck list
- Open the grading interface
- Verify created samples appear
- Test grading actions (approve/reject)
- Verify sample state updates

## Implementation Details

### Research Findings

#### Current Implementation Status

**UI Components (Fully Implemented):**

- ✅ `DeckList` - Shows deck cards with stats (uses hardcoded `mockDecks` array)
- ✅ `GradingInbox` - Main grading interface with sample navigation
- ✅ `SampleDisplay` - Shows conversation history and responses
- ✅ `HumanGradingControls` - Simplified approve (-3) / reject (+3) interface
- ✅ `GraderEvaluation` - Shows AI grader scores with human rating input
- ✅ All loading, error, and empty states implemented

**Data Layer (Mocked):**

- 🔶 `useGradingSamples` hook - Returns mock data with simulated GraphQL delay
- 🔶 Deck data - Hardcoded array in `DeckList.tsx` (lines 13-46)
- 🔶 Sample saving - Only updates local state, no persistence
- 🔶 No `data-deck-id` or `data-sample-id` attributes present

**GraphQL/Isograph Status:**

- ✅ Basic Isograph setup working for eval page
- ✅ Fetches organization and first 10 decks via GraphQL
- ❌ No queries for grading samples implemented
- ❌ No mutations for saving grades implemented
- ❌ Missing connections: deck → samples, sample → graderResults

**Backend Schema Available:**

- ✅ `BfSample` type with `completionData` (JSON)
- ✅ `BfDeck` type with samples connection
- ✅ `BfGraderResult` type for AI evaluations
- ✅ `BfSampleFeedback` type for human feedback
- ❌ No mutations for creating grader results or feedback
- ❌ No sample state fields (approved/rejected/pending)

### Shared Data

**Expects from previous phases:**

- `createdDeckId: string` - Deck ID from Phase 2 (displayed as headline in UI)
- `createdSampleId: string` - Sample ID from Phase 2
- `SAMPLE_INVOICE_TEXT: string` - Test fixture for verification

**Provides to next phases:** None (this is the final phase)

See [shared-data-spec.md](./shared-data-spec.md) for complete data flow.

### Navigation and Deck Selection

1. **Navigate to Eval Page**
   ```typescript
   await t.step("Navigate to eval and find deck", async () => {
     // Click on eval link in navigation
     await smoothClick(
       context.page,
       "nav a[href='/eval']",
       "Eval navigation link",
     );

     // Wait for deck list to load
     await context.page.waitForSelector(".decks-list", {
       visible: true,
       timeout: 10000,
     });
   });
   ```

2. **Find Test Deck**
   ```typescript
   // Frontend should display deck IDs as headlines to enable selection
   // Find deck by ID text content
   const deckSelector = `.deck-card:has-text("${createdDeckId}")`;

   // Alternative: If data-deck-id attributes are added
   // const deckSelector = `[data-deck-id="${createdDeckId}"]`;

   await context.page.waitForSelector(deckSelector, {
     visible: true,
     timeout: 5000,
   });

   // Click triggers EvalContext.startGrading()
   await smoothClick(
     context.page,
     deckSelector,
     "Test deck in list",
   );
   ```

   **Note:** DeckList component needs modification to add `data-deck-id`
   attributes. Currently uses `handleDeckClick` to call
   `startGrading(deckId, deck.name)`.

3. **Verify Grading Interface Loads**
   ```typescript
   // Right sidebar opens in "grading" mode
   await context.page.waitForSelector(".right-sidebar.open", {
     visible: true,
     timeout: 5000,
   });

   // GradingContainer renders with GradingInbox
   await context.page.waitForSelector(".grading-inbox", {
     visible: true,
     timeout: 10000,
   });
   ```

### Sample Verification

1. **Check Sample Appears**
   ```typescript
   // SampleDisplay component shows conversation history
   // Look for the request content in the conversation
   const sampleContent = await context.page.evaluate(() => {
     // Find in conversation history section
     const conversationEl = document.querySelector(".space-y-4");
     return conversationEl?.textContent;
   });

   assert(
     sampleContent?.includes(SAMPLE_INVOICE_TEXT),
     "Created sample should be displayed in conversation",
   );
   ```

2. **Verify Sample Metadata**
   ```typescript
   // Current implementation doesn't have data-sample-id attributes
   // Would need to be added to SampleDisplay component

   // Alternative: Check sample is from correct deck
   const deckName = await context.page.evaluate(() => {
     // GradingInbox shows deck name in header
     return document.querySelector(".text-lg.font-semibold")?.textContent;
   });

   assert(deckName?.includes(createdDeckId), "Correct deck loaded");
   ```

   **Note:** SampleDisplay component needs modification to add `data-sample-id`
   attributes.

### Grading Actions

1. **Test Approve Action**
   ```typescript
   await t.step("Grade sample as approved", async () => {
     // HumanGradingControls uses simplified approve/reject
     // Approve = -3, Reject = +3 (counterintuitive!)
     await smoothClick(
       context.page,
       "button:has-text('Approve')",
       "Approve button",
     );

     // saveGrade is called with score -3
     // Currently only updates local state via setSamples

     // Wait for optimistic update to show
     await context.page.waitForFunction(
       () => {
         // Check if draft grade shows -3
         const draftEl = document.querySelector(".draft-grade");
         return draftEl?.textContent?.includes("-3");
       },
       { timeout: 5000 },
     );
   });
   ```

2. **Verify State Persistence**
   ```typescript
   // Note: Currently no real persistence - only local state
   // This test would fail as grades don't persist across reloads

   // Instead, verify the optimistic update worked
   const savedGrade = await context.page.evaluate(() => {
     // GradingInbox tracks draft grades locally
     // Would need to check the sample's humanGrade field
     const gradeEl = document.querySelector(".human-grade-display");
     return gradeEl?.textContent;
   });

   assert(savedGrade?.includes("-3"), "Grade saved locally");

   // Real persistence test would require GraphQL mutation implementation
   ```

### Error Scenarios

- Handle empty grading inbox
- Test pagination if many samples
- Verify error messages for failed grades
- Test keyboard shortcuts if implemented

## Implementation Status

| Feature                   | Current State          | Required For Phase | Notes                               |
| ------------------------- | ---------------------- | ------------------ | ----------------------------------- |
| Eval page navigation      | Implemented            | Already working    | Current test navigates successfully |
| DeckList component        | Implemented with mocks | Needs update       | Using hardcoded mockDecks array     |
| GradingInbox component    | Implemented            | Already working    | Full UI implemented                 |
| SampleDisplay component   | Implemented            | Already working    | Shows conversation history          |
| HumanGradingControls      | Implemented            | Already working    | Approve/reject buttons work         |
| useGradingSamples hook    | Mock data only         | Needs GraphQL      | Returns hardcoded samples           |
| data-deck-id attributes   | Not implemented        | Better testing     | Would improve test reliability      |
| data-sample-id attributes | Not implemented        | Better testing     | Would improve test reliability      |
| GraphQL sample queries    | Not implemented        | Real data flow     | No BfDeck.samples connection        |
| GraphQL grade mutations   | Not implemented        | Persistence        | No BfSampleFeedback mutations       |
| Sample state persistence  | Not implemented        | Full functionality | Only local state updates            |
| Deck ID display           | Not implemented        | Test selection     | Currently shows names only          |
| Real sample loading       | Not implemented        | Phase 3 completion | Still using mock data               |

## Success Criteria

- [ ] Successfully navigate to eval page
- [ ] Test deck appears in deck list
- [ ] Grading interface opens when deck clicked
- [ ] Created sample displayed correctly
- [ ] Grading actions (approve/reject) work
- [ ] Sample state updates and persists
- [ ] Navigation between samples works

## Dependencies

- Phase 2 must create valid samples
- Eval page must load real data (not mocks)
- GraphQL endpoints must return created samples
- Components need to be updated to remove hardcoded mock data
- DeckList and useGradingSamples need GraphQL integration

### Required Implementation Changes

1. **Display Deck IDs in UI:**
   - Update DeckList to show deck IDs as card headlines instead of names
   - This enables reliable test selection using deck IDs from Phase 2
   - Consider format: "Deck: {deckId}" or just "{deckId}"

2. **Add Data Attributes:**
   - `data-deck-id` to deck cards in DeckList (optional if IDs are visible)
   - `data-sample-id` to samples in SampleDisplay

3. **Replace Mock Data:**
   - Remove `mockDecks` array from DeckList.tsx
   - Update `useGradingSamples` to use Isograph queries

4. **Implement GraphQL:**
   - Query: `BfDeck.samples` connection for grading samples
   - Mutation: Save human feedback to `BfSampleFeedback`
   - Query: Fetch `BfGraderResult` for AI evaluations

5. **Update Components:**
   - Modify Eval.tsx query to fetch samples with decks
   - Connect `saveGrade` to real GraphQL mutation
   - Add sample state tracking (approved/rejected)

## Next Steps

The complete test will combine all phases with proper assertions and cleanup.
