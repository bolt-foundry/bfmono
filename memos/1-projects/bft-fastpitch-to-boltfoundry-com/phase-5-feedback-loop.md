# Phase 5: Manual Feedback Collection

## Objective

Enable our team to manually rate and provide feedback on Fastpitch outputs
through the web dashboard.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration
- ✅ Phase 3 complete: UI/UX implementation
- ✅ Phase 4 complete: Sample display

## Key Implementation Decision

**Unified Grading Structure:** Create a unified grading system where:

- BfGrader entity represents automatic graders (existing)
- BfGraderResult stores all grading results (both automatic and manual)
- BfGraderResult has two 1:1 relationships:
  - `.one("automaticallyGradedBy", () => BfGrader)` for AI grading
  - `.one("manuallyGradedBy", () => BfPerson)` for human grading
- Exactly one of these relationships is set per result
- This replaces the current separate BfGraderResult/BfSampleFeedback structure

## Success Criteria

- [ ] Can rate Fastpitch outputs through web dashboard
- [ ] Feedback is stored as BfGraderResult entities
- [ ] Can see feedback history for samples
- [ ] Manual rating workflow is intuitive and fast

## Implementation Steps

### Step 1: Manual Grading Schema Setup

**Goal:** Replace BfSampleFeedback with BfGraderResult for manual grading only

**Tasks:**

1. **Update BfGraderResult schema**
   (`apps/bfDb/nodeTypes/rlhf/BfGraderResult.ts`):
   ```typescript
   static override bfNodeSpec = this.defineBfNode((f) =>
     f
       .number("score")                                    // -3 to +3
       .string("explanation")                              
       .string("reasoningProcess")                         
       .one("bfSample", () => BfSample)                   
       .one("manuallyGradedBy", () => BfPerson)           // Human grader only for now
   );
   ```

2. **Update GraphQL schema** and regenerate types

**Validation:** Manual grading creates BfGraderResult entities correctly

### Step 2: UI Component Migration

**Goal:** Update human grading interface to use unified BfGraderResult

**Tasks:**

1. **Create Isograph rating component following proper patterns**
   (`apps/boltfoundry-com/isograph/components/BfSample/SampleRatingControls.tsx`):
   ```typescript
   // Component attached to BfSample type (not standalone)
   export const SampleRatingControls = iso(`
     field BfSample.SampleRatingControls @component {
       id
       manualRatings: graderResults(manualOnly: true) {
         edges {
           node {
             SampleRatingDisplay  // Shows existing ratings
           }
         }
       }
     }
   `)(function SampleRatingControls({ data }) {
     // Rating form logic here
   });
   ```

2. **Create rating display component**
   (`apps/boltfoundry-com/isograph/components/BfGraderResult/SampleRatingDisplay.tsx`):
   ```typescript
   // Component attached to BfGraderResult type
   export const SampleRatingDisplay = iso(`
     field BfGraderResult.SampleRatingDisplay @component {
       score
       explanation
       manuallyGradedBy {
         name
       }
     }
   `)(function SampleRatingDisplay({ data }) {
     // Display existing rating
   });
   ```

3. **Update sample list/detail components to reference rating components**:
   - Add `SampleRatingControls` field to existing BfSample components
   - Follow three-level hierarchy: View → List → Item patterns
   - Let each component fetch only what it needs

4. **Update GraphQL mutations** and queries for the new schema

5. **Remove BfSampleFeedback entity and references** throughout the codebase

**Validation:** Manual grading workflow works end-to-end through dashboard

### Step 3: Feedback Analytics Foundation

**Goal:** Create basic system to query and analyze feedback data

**Tasks:**

1. **Create feedback query utilities**
   (`packages/bolt-foundry/feedback-queries.ts`):
   ```typescript
   // Basic feedback querying functions
   async function getFeedbackForSample(sampleId: string);
   async function getFeedbackBySample(deckId: string);
   async function getFeedbackSummary(timeWindow: string);
   ```

2. **Add basic feedback analytics views**:
   - Simple feedback counts and averages
   - Recent feedback activity
   - Basic trends over time

**Validation:** Can query feedback data and show basic analytics

## Technical Architecture

### Database Schema

```typescript
// Updated BfGraderResult (manual grading only for now)
export class BfGraderResult extends BfNode {
  static override bfNodeSpec = this.defineBfNode((f) =>
    f
      .number("score") // -3 to +3
      .string("explanation")
      .string("reasoningProcess")
      .one("bfSample", () => BfSample)
      .one("manuallyGradedBy", () => BfPerson)
    // automaticallyGradedBy relationship can be added later
  );
}
```

### Feedback Loop Data Flow

```
BfSample (Fastpitch output)
    ↓
BfGraderResult (human feedback)
    ↓
Basic Feedback Analytics (counts, averages, trends)
```

### Integration Points

- **Telemetry:** Existing BfClient captures all generations
- **Evaluation:** Manual rating system (automatic evaluation can be added later)
- **UI:** Isograph components following proper patterns (SampleRatingControls,
  SampleRatingDisplay)
- **Analytics:** PostHog integration for usage tracking
- **Context:** Deck system for dynamic prompt modification

## Risk Mitigation

- **Schema Changes:** Test schema updates in development before deploying
- **UI Compatibility:** Maintain existing interaction patterns during transition
- **Performance:** Use existing indexing and query optimization patterns
- **Rollback:** Implement feature flags for gradual rollout
- **Feedback Quality:** Start with simple feedback before advanced features

## Next Phase

Once manual feedback collection works, proceed to
[Phase 6: Automatic Grader Integration](./phase-6-automatic-grading.md)
