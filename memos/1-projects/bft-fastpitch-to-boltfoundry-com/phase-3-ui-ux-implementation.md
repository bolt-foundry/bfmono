# Phase 3: UI/UX Implementation 🟡 IN PROGRESS

## Objective

Create PromptGrade.tsx to replace Eval.tsx (handling the layout), expose
components via Isograph, and implement proper navigation, home, and login pages.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration with real data

## Current State

- ✅ Routing architecture implemented with redirects
- ✅ Grade component fetches real deck data
- ❌ Eval.tsx still exists and needs to be replaced
- ❌ PromptGrade.tsx component doesn't exist yet
- ❌ Navigation components not exposed via Isograph
- ❌ Home and login pages need proper implementation

## Implementation Tasks

### 1. Create PromptGrade Component

**Goal**: Replace Eval.tsx with a new PromptGrade.tsx that handles layout

**Tasks**:

- [ ] Create PromptGrade.tsx component
- [ ] Port layout logic from Eval.tsx
- [ ] Expose PromptGrade via Isograph
- [ ] Update routes to use PromptGrade instead of Eval
- [ ] Delete old Eval.tsx component
- [ ] Update E2E test to verify PromptGrade renders

**Success Criteria**:

- PromptGrade component renders without errors
- All existing functionality from Eval.tsx is preserved
- E2E test passes with new component
- No references to Eval.tsx remain in codebase

### 2. Implement Navigation Components

**Goal**: Create and expose navigation components via Isograph

**Tasks**:

- [ ] Create main navigation component
- [ ] Expose nav component via Isograph
- [ ] Add section switching (Grade, Analyze, Chat)
- [ ] Implement user menu/profile dropdown
- [ ] Ensure navigation works with redirect-based routing
- [ ] Add E2E test for navigation between sections

**Success Criteria**:

- Navigation component accessible via Isograph query
- Can switch between Grade, Analyze, and Chat sections
- User menu displays current user info
- E2E test verifies navigation works
- Navigation state persists across page refreshes

### 3. Update Home Page Navigation

**Goal**: Update existing home page to use Isograph-based navigation

**Tasks**:

- [ ] Keep existing Home component content
- [ ] Update nav to use Isograph component
- [ ] Remove nav from /ui route
- [ ] Ensure nav component exposed via Isograph
- [ ] Add E2E test for updated navigation

**Success Criteria**:

- Home page renders with Isograph nav
- Navigation removed from /ui
- Links to Grade, Analyze, Chat sections work
- E2E test verifies navigation works
- No duplicate navigation components

### 4. Convert Login Page to Isograph

**Goal**: Convert existing login page to use Isograph

**Tasks**:

- [ ] Keep existing Login component design
- [ ] Expose Login component via Isograph
- [ ] Ensure authentication flow still works
- [ ] Maintain existing organization selection
- [ ] Add E2E test for login flow

**Success Criteria**:

- Login page works via Isograph
- No visual changes from current design
- Authentication flow unchanged
- E2E test verifies login still works
- Existing functionality preserved

### 5. Wire Everything Together

**Goal**: Ensure all components work cohesively

**Tasks**:

- [ ] Update EntrypointGradeDecks to use PromptGrade
- [ ] Ensure all routes properly configured
- [ ] Verify authentication flow works
- [ ] Test navigation between all pages
- [ ] Run `bft iso` to compile all Isograph queries
- [ ] Run full E2E test suite
- [ ] Fix any integration issues
- [ ] Update isograph-patterns.md with file organization by GraphQL type

**Success Criteria**:

- All routes work without errors
- Authentication persists across navigation
- `bft iso` compiles without errors
- All E2E tests pass
- No console errors in browser

## Technical Notes

- All components must be exposed via Isograph
- Use existing routing architecture from Phase 2
- Maintain authentication patterns with CurrentViewerLoggedIn/LoggedOut
- Keep real-time data updates working

## Overall Phase Success Criteria

- [ ] PromptGrade.tsx replaces Eval.tsx completely
- [ ] All app components accessible via Isograph
- [ ] Navigation works between all sections
- [ ] Home and login pages functional
- [ ] Old Eval.tsx deleted
- [ ] UI maintains or improves on previous design
- [ ] All E2E tests pass (including existing ones from Phase 2)
- [ ] No regression in telemetry functionality
- [ ] Code follows Isograph patterns from documentation

## Next Phase

Once UI/UX is implemented, proceed to
[Phase 4: Sample Display](./phase-4-sample-display.md)
