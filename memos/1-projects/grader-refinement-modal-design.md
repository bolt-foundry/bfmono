# Grader Refinement Modal Design

_Date: 2025-08-18_

## Problem

The Grade page has a workflow where samples get human graded, then need to be
used to refine/improve graders. Currently unclear where this "Refine" step
should live in the UI without creating confusing navigation.

## Solution: Bulk Action Modal

Add "Refine Graders" bulk action to existing Samples tab that opens a guided
modal workflow.

## Modal Flow

### Step 1: Grader Selection & Visualization

**Header**: "Refine with {n} samples"

**For each grader, display:**

- Grader name
- Checkbox to select for refinement
- Deviation distribution graph
- Baseline accuracy metric

### Deviation Graph Specification

- **Purpose**: Show how far each grader deviates from human grades across
  selected samples
- **X-axis**: Deviation from human grade (-6 to +6 range)
  - Negative = grader underrated (was harsher than human)
  - Positive = grader overrated (was more lenient than human)
  - Center line (x=0) = perfect agreement
- **Y-axis**: Count of samples at that deviation level
- **Grade scale**: -3, -2, -1, +1, +2, +3 (no zero)
- **Max deviation**: ±6 (human=+3, grader=-3 = -6 difference)

### Pattern Recognition

- **Good grader**: Tall narrow peak at x=0
- **Consistently harsh**: Peak shifted left (negative)
- **Consistently lenient**: Peak shifted right (positive)
- **Inconsistent grader**: Wide, flat distribution
- **Extremely confused**: Bars at x=-6 or x=+6

### Accuracy Metric

Display baseline accuracy as: "73% within ±1 point"

### Step 2: Progress & Results

1. Modal switches to progress view with "See details on Graders tab" link
2. Graders tab shows progress bars under each refining grader
3. Progress completes → shows result summary clickable for details
4. Click result → detailed modal showing what changed in the grader

## Benefits

- No new tabs/pages needed
- Familiar bulk selection UX pattern
- Visual decision-making for which graders need refinement
- Clear feedback loop on refinement results
- Maintains clean current navigation structure

## Technical Notes

- Leverages existing bulk select infrastructure
- Modal-based workflow keeps UI uncluttered
- Progress tracking integrated with existing Graders tab
- Automated refinement process with human oversight/selection
- **Graphs built with SVG** - No charting library needed since deviation
  distribution graphs are simple bar charts

## Project Plan

### Phase 1: Core Modal Infrastructure

- [ ] Connect existing "Refine" button on Samples tab to new modal workflow
- [ ] Create refinement modal using BfDsModal component
- [ ] Implement modal state management (open/close, step navigation)
- [ ] Add sample selection data flow to modal

### Phase 2: Grader Selection & Visualization

- [ ] Build deviation calculation logic (human grade vs grader predictions)
- [ ] Create SVG bar chart component for deviation distribution
- [ ] Implement grader card layout with checkboxes
- [ ] Add baseline accuracy calculation ("X% within ±1 point")
- [ ] Style grader selection interface

### Phase 3: Refinement Process Integration (with Mock Functions)

- [ ] Create mock refinement API that returns expected progress/results
      structure
- [ ] Implement progress tracking state management using mock data
- [ ] Add progress view in modal with "See details on Graders tab" link
- [ ] Update Graders tab to show progress bars during mock refinement

### Phase 4: Results & Feedback (with Mock Functions)

- [ ] Create mock completion detection that triggers after timeout
- [ ] Add results summary display using mock improvement data
- [ ] Create detailed results modal showing mock "what changed" data
- [ ] Add error handling and user feedback for mock failed refinements

### Phase 5: Polish & Testing

- [ ] Add loading states and transitions
- [ ] Implement responsive design for modal
- [ ] Write unit tests for deviation calculation logic
- [ ] Write integration tests for full refinement workflow
- [ ] User testing and feedback incorporation
