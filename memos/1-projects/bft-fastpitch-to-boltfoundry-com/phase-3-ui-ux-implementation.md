# Phase 3: UI/UX Implementation ✅ COMPLETED (PR #202)

## Objective

Create PromptGrade.tsx to replace Eval.tsx (handling the layout), expose
components via Isograph, and implement proper navigation, home, and login pages.

## Prerequisites

- ✅ Phase 1 complete: Telemetry visible
- ✅ Phase 2 complete: Dashboard integration with real data

## Current State

- ✅ Routing architecture implemented with redirects
- ✅ Grade component fetches real deck data
- ✅ Eval.tsx replaced with proper Isograph components
- ✅ PromptGrade context created (renamed from EvalContext)
- ✅ Navigation components created with hardcoded values
- ✅ Files reorganized into isograph/ directory structure
- ✅ DecksList and DecksListItem components implemented
- ✅ E2E test passing with real deck data

## Implementation Tasks

### 1. Create PromptGrade Component ✅

**Goal**: Replace Eval.tsx with a new PromptGrade.tsx that handles layout

**Tasks**:

- [x] Create PromptGrade context (renamed from EvalContext)
- [x] Port layout logic from Eval.tsx
- [x] Create Grade component on CurrentViewerLoggedIn
- [x] Update routes to use new component structure
- [x] Delete old Eval.tsx component
- [x] Update E2E test to verify new components render

**Success Criteria**:

- PromptGrade component renders without errors
- All existing functionality from Eval.tsx is preserved
- E2E test passes with new component
- No references to Eval.tsx remain in codebase

### 2. Implement Navigation Components ✅

**Goal**: Create and expose navigation components via Isograph

**Tasks**:

- [x] Create SidebarNav component with hardcoded navigation
- [x] Implement Grade section (active)
- [x] Add Analyze and Chat sections (disabled for now)
- [x] Simplify layout components to be dumb containers
- [x] Ensure navigation works with redirect-based routing
- [x] E2E test verifies Grade section loads properly

**Success Criteria**:

- Navigation component accessible via Isograph query
- Can switch between Grade, Analyze, and Chat sections
- User menu displays current user info
- E2E test verifies navigation works
- Navigation state persists across page refreshes

### 3. Update Home Page Navigation ⏳

**Goal**: Update existing home page to use Isograph-based navigation

**Tasks**:

- [ ] Keep existing Home component content
- [ ] Update nav to use Isograph component
- [ ] Remove nav from /ui route
- [ ] Ensure nav component exposed via Isograph
- [ ] Add E2E test for updated navigation

**Note**: Deferred to future work

**Success Criteria**:

- Home page renders with Isograph nav
- Navigation removed from /ui
- Links to Grade, Analyze, Chat sections work
- E2E test verifies navigation works
- No duplicate navigation components

### 4. Convert Login Page to Isograph ⏳

**Goal**: Convert existing login page to use Isograph

**Tasks**:

- [ ] Keep existing Login component design
- [ ] Expose Login component via Isograph
- [ ] Ensure authentication flow still works
- [ ] Maintain existing organization selection
- [ ] Add E2E test for login flow

**Note**: Deferred to future work

**Success Criteria**:

- Login page works via Isograph
- No visual changes from current design
- Authentication flow unchanged
- E2E test verifies login still works
- Existing functionality preserved

### 5. Wire Everything Together ✅

**Goal**: Ensure all components work cohesively

**Tasks**:

- [x] Update EntrypointGradeDecks to use Grade component
- [x] Ensure all routes properly configured
- [x] Verify authentication flow works
- [x] Files reorganized into isograph/ directory by GraphQL type
- [x] Run `bft iso` to compile all Isograph queries
- [x] E2E test (fastpitch-telemetry) passes
- [x] Fixed SSR issues with window references
- [x] Updated isograph-patterns.md with file organization by GraphQL type

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

- [x] PromptGrade context replaces EvalContext completely
- [x] Core components reorganized into isograph/ directory
- [x] Navigation works for Grade section (Analyze/Chat disabled)
- [x] DecksList displays real deck data from organization
- [x] Old Eval.tsx deleted
- [x] UI maintains previous design with improved organization
- [x] E2E test passes with real deck data flow
- [x] No regression in telemetry functionality
- [x] Code follows Isograph patterns from documentation
- [ ] Home and login pages to be updated in future work

## Next Phase

Once UI/UX is implemented, proceed to
[Phase 4: Sample Display](./phase-4-sample-display.md)
