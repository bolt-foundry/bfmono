# Phase 6: Automatic Grader Integration

## Objective

Integrate automatic AI grading system to evaluate Fastpitch outputs
systematically, complementing manual feedback with scalable automated
evaluation.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration
- ✅ Phase 3 complete: UI/UX implementation
- ✅ Phase 4 complete: Sample display
- ✅ Phase 5 complete: Manual feedback collection

## Success Criteria

- [ ] Automatic graders evaluate Fastpitch outputs
- [ ] BfGraderResult handles both automatic and manual grading
- [ ] Can compare human vs AI grading results
- [ ] Automatic grading runs systematically on new samples

## Implementation Steps

### Step 1: Unified Grading Schema Extension

**Goal:** Extend BfGraderResult to support both automatic and manual grading

**Tasks:**

1. **Add automaticallyGradedBy relationship** to BfGraderResult:
   ```typescript
   static override bfNodeSpec = this.defineBfNode((f) =>
     f
       .number("score")                                    // -3 to +3
       .string("explanation")                              
       .string("reasoningProcess")                         
       .one("bfSample", () => BfSample)                   
       .one("automaticallyGradedBy", () => BfGrader)      // AI grader
       .one("manuallyGradedBy", () => BfPerson)           // Human grader
   );
   ```

2. **Add validation logic** to ensure exactly one grading relationship is set:
   - Either `automaticallyGradedBy` OR `manuallyGradedBy` must be populated
   - Add constructor validation or business logic checks

3. **Update GraphQL schema** and regenerate types

**Validation:** BfGraderResult can handle both automatic and manual grading
sources

### Step 2: Automatic Grader System Integration

**Goal:** Connect existing AIBFF grading system to unified BfGraderResult

**Tasks:**

1. **Create Fastpitch-specific graders**:
   - Create grader decks for news story selection quality
   - Define evaluation criteria for engineering relevance
   - Set up graders for story selection accuracy and helpfulness

2. **Integrate AIBFF calibrate system**:
   - Modify calibrate command to work with Fastpitch samples
   - Create BfGraderResult entities with `automaticallyGradedBy` relationship
   - Preserve existing score, explanation, and reasoningProcess fields

3. **Create automatic grading pipeline**:
   - Trigger automatic grading on new Fastpitch samples
   - Process samples through existing grader system
   - Store results as BfGraderResult entities

**Validation:** New Fastpitch samples are automatically evaluated and stored

### Step 3: Grading Results Display Integration

**Goal:** Update UI to show both automatic and manual grading results

**Tasks:**

1. **Update Isograph components** to display grading source:
   ```typescript
   // Update SampleRatingDisplay to show grading source
   export const SampleRatingDisplay = iso(`
     field BfGraderResult.SampleRatingDisplay @component {
       score
       explanation
       automaticallyGradedBy {
         name: graderText
       }
       manuallyGradedBy {
         name
       }
     }
   `)(function SampleRatingDisplay({ data }) {
     const isAutomatic = !!data.automaticallyGradedBy;
     const graderName = isAutomatic
       ? data.automaticallyGradedBy?.name
       : data.manuallyGradedBy?.name;

     // Display with appropriate styling/icons
   });
   ```

2. **Add grading source indicators**:
   - Visual distinction between AI and human ratings
   - Show grader name/type in display
   - Add icons or badges to indicate source

3. **Update sample list views** to show both types of ratings

**Validation:** Can visually distinguish between automatic and manual ratings

### Step 4: Human-AI Agreement Analysis

**Goal:** Enable comparison and analysis of human vs AI grading

**Tasks:**

1. **Create agreement analysis utilities**:
   ```typescript
   // Calculate agreement between human and AI ratings
   async function calculateAgreementRate(sampleIds: string[]);
   async function findDisagreementSamples(threshold: number);
   async function analyzeGradingPatterns(deckId: string);
   ```

2. **Implement disagreement detection**:
   - Flag samples where human and AI ratings differ significantly
   - Track agreement rates over time
   - Identify patterns in disagreements

3. **Add agreement metrics to dashboard**:
   - Overall human-AI agreement percentage
   - Disagreement samples for review
   - Trends in agreement over time

**Validation:** Can measure and track human-AI grading agreement

### Step 5: Systematic Evaluation Pipeline

**Goal:** Automate the grading process for consistent evaluation

**Tasks:**

1. **Create automated grading triggers**:
   - Grade new samples automatically after telemetry collection
   - Queue-based processing for scalability
   - Error handling and retry logic

2. **Implement grading orchestration**:
   - Run multiple graders on each sample
   - Manage concurrent grading operations
   - Store all grading results systematically

3. **Add grading status tracking**:
   - Track which samples have been graded
   - Monitor grading pipeline health
   - Alert on grading failures

**Validation:** New samples are automatically graded without manual intervention

## Technical Architecture

### Unified Grading Schema

```typescript
// Updated BfGraderResult supporting both sources
export class BfGraderResult extends BfNode {
  static override bfNodeSpec = this.defineBfNode((f) =>
    f
      .number("score") // -3 to +3
      .string("explanation")
      .string("reasoningProcess")
      .one("bfSample", () => BfSample)
      .one("automaticallyGradedBy", () => BfGrader) // AI grader
      .one("manuallyGradedBy", () => BfPerson) // Human grader
  );
}
```

### Grading Pipeline Data Flow

```
BfSample (Fastpitch output)
    ↓
Automatic Grading Pipeline (AIBFF system)
    ↓
BfGraderResult (automaticallyGradedBy)
    ↓
Manual Review (optional)
    ↓
BfGraderResult (manuallyGradedBy)
    ↓
Agreement Analysis
```

### Integration Points

- **AIBFF System**: Existing automatic grading infrastructure
- **Grader Decks**: Domain-specific evaluation criteria for Fastpitch
- **UI Components**: Updated Isograph components for dual grading display
- **Analytics**: Agreement tracking and disagreement analysis
- **Pipeline**: Automated grading orchestration and monitoring

## Risk Mitigation

- **Schema Validation**: Ensure exactly one grading relationship is set
- **Grading Quality**: Monitor and validate automatic grader performance
- **Performance**: Optimize automatic grading pipeline for scalability
- **Disagreement Handling**: Clear process for resolving human-AI conflicts
- **Fallback**: Manual grading remains available if automatic grading fails

## Next Phase

Once automatic grading is integrated, proceed to
[Phase 7: Fastpitch Feedback Integration](./phase-7-fastpitch-integration.md)
