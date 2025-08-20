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

### Step 2: Detailed Progress Tracking

**Multi-Stage Refinement Pipeline:**

1. **Analyze Samples** (20% weight) - Examining training samples and identifying
   patterns
2. **Adjust Grader** (30% weight) - Modifying grader parameters and bias
   corrections
3. **Test Grader** (50% weight) - Running grader through test suite (takes
   longest)

**Progress Display:**

- Real-time progress bars with overall completion percentage
- Current stage indicator with descriptive text
- Stage-specific status messages ("Analyzing samples...", "Testing grader...")
- Color-coded status (pending/refining/completed/failed)
- "See detailed progress on the Graders tab" link

### Step 3: Comprehensive Results

**Summary View:**

- Success/failure count with improvement statistics
- Before/after accuracy comparison with percentage gains
- Training samples vs test samples used in refinement

**Detailed Changes Applied (Expandable):**

- **Bias Correction**: Specific corrections made (e.g., "Reduced harsh grading
  tendency")
- **Parameters Adjusted**: List of technical parameters modified
  (confidence_threshold, bias_correction_factor, etc.)
- **Threshold Changes**: Before/after values for each adjusted parameter
- Collapsible technical details for transparency

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

### Phase 1: Core Modal Infrastructure ✅

- [x] Connect existing "Refine" button on Samples tab to new modal workflow
- [x] Create refinement modal using BfDsModal component
- [x] Implement modal state management (open/close, step navigation)
- [x] Add sample selection data flow to modal

### Phase 2: Grader Selection & Visualization ✅

- [x] Build deviation calculation logic (human grade vs grader predictions)
- [x] Create React div-based bar chart component for deviation distribution
- [x] Implement grader card layout with checkboxes and CSS classes
- [x] Add baseline accuracy calculation ("X% within ±1 point")
- [x] Style grader selection interface with design system variables

### Phase 3: Refinement Process Integration (with Mock Functions) ✅

- [x] Create mock refinement API with multi-stage pipeline simulation
- [x] Implement progress tracking state management with stage-specific logic
- [x] Add detailed progress view with stage descriptions and weighted progress
- [x] Mock realistic refinement timing (analyze → adjust → test → complete)

### Phase 4: Results & Feedback (with Mock Functions) ✅

- [x] Create mock completion detection with realistic success/failure rates
- [x] Add comprehensive results summary with before/after accuracy
- [x] Create detailed "changes applied" display with technical parameters
- [x] Add error handling and expandable technical details
- [x] Implement realistic parameter adjustments and bias corrections

### Phase 5: Polish & Testing

- [x] Add loading states and transitions with smooth progress animations
- [x] Implement responsive design with CSS classes in evalStyle.css
- [ ] Write unit tests for deviation calculation logic
- [ ] Write integration tests for full refinement workflow
- [ ] User testing and feedback incorporation
