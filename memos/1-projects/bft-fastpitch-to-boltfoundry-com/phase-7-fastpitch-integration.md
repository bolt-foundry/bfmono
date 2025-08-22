# Phase 6: Fastpitch Feedback Integration

## Objective

Use collected feedback data to improve Fastpitch generation quality by
incorporating positive/negative examples into the generation process.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration
- ✅ Phase 3 complete: UI/UX implementation
- ✅ Phase 4 complete: Sample display
- ✅ Phase 5 complete: Manual feedback collection
- ✅ Phase 6 complete: Automatic grader integration

## Success Criteria

- [ ] Feedback influences Fastpitch generation
- [ ] Can see improved output quality with feedback integration
- [ ] System gracefully handles cases with no feedback data
- [ ] Feedback integration is optional and configurable

## Implementation Steps

### Step 1: Feedback Analysis System

**Goal:** Create system to analyze feedback patterns and extract insights

**Tasks:**

1. **Create feedback analysis utilities**
   (`packages/bolt-foundry/feedback-analysis.ts`):
   ```typescript
   // Query highly-rated examples (score >= 2)
   async function getPositiveExamples(deckId: string, limit: number);

   // Query poorly-rated examples (score <= -2)
   async function getNegativeExamples(deckId: string, limit: number);

   // Analyze feedback trends and patterns
   async function analyzeFeedbackTrends(deckId: string, timeWindow: string);
   ```

2. **Implement feedback aggregation queries**:
   - Use existing indexing patterns (bfOid, createdAt, sortValue)
   - Leverage relationship traversal via BfEdge system
   - Support filtering by time period, grader type, score ranges

3. **Create feedback insights generation**:
   - Identify common themes in highly-rated selections
   - Extract patterns from poorly-rated examples
   - Generate summary insights for prompt injection

**Validation:** Can query and analyze feedback data programmatically

### Step 2: Context Injection System

**Goal:** Modify Fastpitch generation to incorporate feedback insights

**Tasks:**

1. **Enhance deck context system** (`infra/bft/tasks/fastpitch.bft.ts`):
   - Extend context variable injection (lines 90-97)
   - Add `positiveExamples`, `negativeExamples`, `feedbackTrends` variables
   - Query feedback data before deck rendering

2. **Implement dynamic context injection**:
   - Query BfGraderResult entities for feedback patterns
   - Format feedback insights as context strings
   - Inject into deck context variables at runtime (not template)

3. **Handle cases with no feedback data gracefully**:
   - Fallback to standard generation when insufficient feedback
   - Log feedback integration attempts for debugging

**Validation:** Context variables are populated with feedback data

### Step 3: Feedback-Driven Generation

**Goal:** Enable Fastpitch to use feedback in generation process

**Tasks:**

1. **Add feedback-driven generation mode**:
   - Command flag: `bft fastpitch generate --use-feedback`
   - Falls back to standard generation if insufficient feedback

2. **Implement feedback context formatting**:
   - Format positive examples as "successful selections to emulate"
   - Format negative examples as "poor selections to avoid"
   - Include reasoning from feedback explanations

3. **Test feedback integration**:
   - Generate with and without feedback integration
   - Verify context injection is working
   - Compare output quality subjectively

**Validation:** Fastpitch generations include feedback-derived context in
prompts

### Step 4: Feedback Loop Validation

**Goal:** Verify that feedback integration improves output quality

**Tasks:**

1. **Create before/after comparison framework**:
   - Generate baseline samples without feedback
   - Generate comparison samples with feedback integration
   - Store both sets for manual evaluation

2. **Implement feedback effectiveness measurement**:
   - Track average scores before/after feedback integration
   - Monitor feedback collection velocity
   - Log feedback integration success/failure rates

3. **Create feedback loop monitoring**:
   - Dashboard showing feedback integration status
   - Metrics on feedback data usage in generation
   - Alerts for feedback integration failures

**Validation:** Can demonstrate improved output quality with feedback
integration

## Technical Architecture

### Feedback Integration Data Flow

```
BfGraderResult (collected feedback)
    ↓
Feedback Analysis (positive/negative patterns)
    ↓
Context Injection (runtime variable population)
    ↓
Enhanced Fastpitch Generation
    ↓
New BfSample (improved outputs)
```

### Integration Points

- **Feedback Analysis:** Query utilities for pattern extraction
- **Context System:** Existing deck context variable injection
- **Generation:** Fastpitch CLI with feedback integration flag
- **Monitoring:** Basic effectiveness tracking and logging

## Risk Mitigation

- **Insufficient Feedback:** Graceful fallback to standard generation
- **Context Bloat:** Limit feedback examples to reasonable sizes
- **Performance Impact:** Cache feedback analysis results
- **Quality Regression:** Maintain A/B testing capability
- **Feature Flags:** Optional feedback integration for safe rollout

## Next Phase

Once feedback integration works, proceed to
[Phase 8: Quality Measurement Dashboard](./phase-8-quality-measurement.md)
