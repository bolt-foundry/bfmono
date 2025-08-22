# PromptGrade Overview vs Phase Plans Reconciliation

## Summary

The **overview.md** represents our new understanding of building PromptGrade as
a human-in-the-loop evaluation system for RLHF workflows. The existing phase
plans were built around a more technical telemetry-focused approach. This
document shows where they diverge and how to align them.

## Core Alignment Issues

### 1. **Naming & Branding**

- **Overview**: Calls it "PromptGrade" - the evaluation interface product
- **Phases**: Still uses "fastpitch-to-boltfoundry-com" folder name and focuses
  on telemetry integration
- **Alignment needed**: Rename project folder and update phase documentation to
  reflect PromptGrade branding

### 2. **User Experience Focus**

- **Overview**: Emphasizes user workflow - Inbox → Manual Grade → Ground Truth →
  Calibration
- **Phases**: Focus heavily on backend telemetry, GraphQL schema, and technical
  implementation
- **Gap**: Missing the intuitive "Inbox workflow" that's central to PromptGrade
  UX

### 3. **Grading Workflow Conceptualization**

- **Overview**: Clear workflow: Auto-Grade → Inbox (needs validation) → Manual
  Grade → Samples History
- **Phases**: Technical approach with BfGraderResult entities but doesn't match
  the conceptual workflow
- **Misalignment**: Phase plans treat grading as database operations, overview
  treats it as user workflow steps

## Phase-by-Phase Analysis

### Phases 1-4: ✅ **Well Aligned**

These phases successfully implemented telemetry collection and sample display,
which aligns with the overview's requirement for "AI Processing" and viewing
outputs.

### Phase 5: Manual Feedback Collection

- **Overview expectation**: "Humans provide manual grades to establish what
  'good' looks like"
- **Phase plan**: Technical BfGraderResult schema updates
- **Gap**: Missing the "Inbox" concept where samples appear for human validation

### Phase 6: Automatic Grading

- **Overview expectation**: "Grader deck provides automatic grades"
- **Phase plan**: Integrate AIBFF grading system with unified BfGraderResult
- **Alignment**: ✅ Good match, though could better emphasize calibration
  learning

### Phase 7: Feedback Integration

- **Overview expectation**: "System learns from human grades to improve
  automatic grading"
- **Phase plan**: Use feedback to improve Fastpitch generation quality
- **Major divergence**: Overview wants to improve **grader calibration**, phases
  want to improve **actor deck outputs**

### Phase 8: Quality Measurement

- **Overview expectation**: "Analysis → Validated samples provide scientific
  evidence for improving actor decks"
- **Phase plan**: Build analytics dashboard for feedback loop effectiveness
- **Partial alignment**: Analytics are good, but focus should be on **scientific
  evidence for deck improvements**

### Phase 9: Iteration & Polish

- **Overview expectation**: "Deck Improvement → Teams update actor deck
  prompts/models based on grading insights"
- **Phase plan**: System polish and deployment readiness
- **Gap**: Missing the key outcome - enabling teams to improve their actor decks

## Key Missing Elements

### 1. **Inbox Tab Implementation**

The overview's core workflow starts with an "Inbox Tab" where auto-graded
samples need validation. Current phases don't implement this UX pattern.

### 2. **Grader Calibration Learning**

Overview emphasizes the system learning from human grades to improve automatic
grading. Phase 7 redirects this to improving generation instead.

### 3. **Ground Truth Establishment**

The overview focuses on establishing reliable ground truth through human
validation. Phases treat human feedback as just another data point.

### 4. **Actor Deck Improvement Loop**

Overview ends with teams using insights to improve actor decks. Phase 9 focuses
on system polish rather than enabling this workflow.

## Recommended Alignment Actions

### Immediate (Naming & Branding)

1. Rename project folder: `bft-fastpitch-to-boltfoundry-com` → `promptgrade`
2. Update all documentation to use "PromptGrade" branding
3. Refocus messaging from "telemetry integration" to "human-in-the-loop
   evaluation"

### Short-term (UX Alignment)

1. **Implement Inbox workflow** in current Grade component:
   - Samples Tab → filter to show samples needing validation
   - Priority queue based on confidence scores or age
   - Clear "validate this grade" user actions

2. **Reframe grading UI** around validation workflow:
   - Show auto-grade prominently
   - Ask human to "confirm" or "correct" the grade
   - Emphasize ground truth establishment

### Medium-term (Learning Focus)

1. **Redirect Phase 7** from generation improvement to grader calibration:
   - Use human feedback to improve automatic grading accuracy
   - Measure grader agreement rates and calibration
   - Focus on reducing samples needing human validation

2. **Update Phase 8** analytics to emphasize:
   - Grader calibration metrics
   - Ground truth establishment progress
   - Scientific evidence quality for actor deck decisions

### Long-term (Complete Vision)

1. **Extend Phase 9** to include actor deck improvement tools:
   - Insights dashboard for deck authors
   - Recommendations based on validated grading data
   - Integration hooks for deck modification workflows

## Conclusion

The current phase plans provide a solid technical foundation but need
realignment around the PromptGrade user experience and learning objectives. The
most critical gaps are the Inbox workflow implementation and redirecting the
feedback loop toward grader calibration rather than generation improvement.
