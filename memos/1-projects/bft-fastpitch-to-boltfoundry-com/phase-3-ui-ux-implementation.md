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

- [ ] Create PromptGrade.tsx component
- [ ] Port layout logic from Eval.tsx
- [ ] Expose PromptGrade via Isograph
- [ ] Update routes to use PromptGrade instead of Eval
- [ ] Delete old Eval.tsx component

### 2. Implement Navigation Components

**Goal**: Create and expose navigation components via Isograph

- [ ] Create main navigation component
- [ ] Expose nav component via Isograph
- [ ] Add section switching (Grade, Analyze, Chat)
- [ ] Implement user menu/profile dropdown
- [ ] Ensure navigation works with redirect-based routing

### 3. Create Home Page

**Goal**: Landing page accessible via Isograph

- [ ] Create Home component
- [ ] Expose via Isograph
- [ ] Add route configuration
- [ ] Include getting started content
- [ ] Link to main features

### 4. Enhance Login Page

**Goal**: Professional login experience via Isograph

- [ ] Update/create Login component
- [ ] Expose via Isograph
- [ ] Ensure proper authentication flow
- [ ] Add organization selection/creation
- [ ] Style consistent with brand

### 5. Wire Everything Together

**Goal**: Ensure all components work cohesively

- [ ] Update EntrypointGradeDecks to use PromptGrade
- [ ] Ensure all routes properly configured
- [ ] Verify authentication flow works
- [ ] Test navigation between all pages
- [ ] Run `bft iso` to compile all Isograph queries

## Technical Notes

- All components must be exposed via Isograph
- Use existing routing architecture from Phase 2
- Maintain authentication patterns with CurrentViewerLoggedIn/LoggedOut
- Keep real-time data updates working

## Success Criteria

- [ ] PromptGrade.tsx replaces Eval.tsx completely
- [ ] All components accessible via Isograph
- [ ] Navigation works between all sections
- [ ] Home and login pages functional
- [ ] Old Eval.tsx deleted
- [ ] UI maintains or improves on previous design

## Next Phase

Once UI/UX is implemented, proceed to
[Phase 4: Sample Display](./phase-4-sample-display.md)
