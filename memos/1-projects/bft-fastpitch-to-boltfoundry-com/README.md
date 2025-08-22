# BFT Fastpitch to boltfoundry.com Integration

## Goal

Connect Fastpitch telemetry to the Bolt Foundry dashboard and establish the
feedback loop for improving AI responses through RLHF.

## Target: Hello World

**MVP:** Run `bft fastpitch` and see the telemetry data show up in the
boltfoundry.com dashboard.

## Documents

- [Open Questions](./open-questions.md) - Questions to answer as we build
- [Answered Questions](./answered-questions.md) - Resolved questions and
  decisions
- [Anti-Goals](./anti-goals.md) - What we're NOT trying to do

## Implementation Phases

- [Phase 1: Telemetry Visibility](./phase-1-telemetry-visibility.md) - Get data
  showing up
- [Phase 2: Dashboard Integration](./phase-2-dashboard-integration.md) - Build
  proper UI
- [Phase 3: UI/UX Implementation](./phase-3-ui-ux-implementation.md) -
  PromptGrade, nav, home, login
- [Phase 4: Sample Display](./phase-4-sample-display.md) - Ensure samples flow
  and display
- [Phase 5: Feedback Loop](./phase-5-feedback-loop.md) - Enable grading and
  improvement
- [Phase 6: Iteration & Polish](./phase-6-iteration-polish.md) - Refine and
  prepare for customers

## Current Status

✅ **Phase 1: Telemetry Visibility** - Completed (PR #190) ✅ **Phase 2:
Dashboard Integration** - Completed (PR #190) ✅ **Phase 3: UI/UX
Implementation** - Completed (PR #202) 🚧 **Phase 4: Sample Display** - Mostly
Complete (PR #244) ⏳ **Phase 5: Feedback Loop** - Not Started ⏳ **Phase 6:
Iteration & Polish** - Not Started

## Success Criteria

- [x] Fastpitch telemetry visible in dashboard ✅
- [x] Can view individual run details ✅
- [x] UI/UX properly implemented with Isograph patterns (Phase 3) ✅
- [x] Samples properly displayed (Phase 4) ✅
- [ ] Can provide feedback on outputs (Phase 5)
- [ ] Feedback influences future generations (Phase 5)

## Key Accomplishments

### Phase 1 & 2 (PR #190)

- **Database Layer**: Implemented lazy adapter registration and proper
  relationship methods
- **Authentication**: Fixed Isograph type refinement for secure data access
- **Real Data**: Dashboard now displays actual telemetry data (no more mocks)
- **Routing**: Clean redirect chain provides intuitive navigation
- **Testing**: Comprehensive E2E test validates entire integration flow

### Phase 3 (PR #202)

- **Isograph Migration**: Reorganized components by GraphQL type into isograph/
  directory
- **DecksList Implementation**: Created DecksList and DecksListItem components
  with real data
- **Context Rename**: Renamed EvalContext to PromptGradeContext throughout
  codebase
- **Layout Simplification**: Converted layout components to dumb containers
- **SSR Fixes**: Fixed window references for proper server-side rendering
- **Navigation**: Implemented hardcoded navigation with Grade active,
  Analyze/Chat disabled
- **E2E Test**: fastpitch-telemetry test now passes with complete deck data flow

### Phase 4 (PR #244)

- **Data Structure Migration**: Renamed `completionData` → `telemetryData`
  throughout codebase
- **Mutation Removal**: Removed `submitSample` mutation from BfSample.ts
- **JSON Serialization**: Fixed GraphQL JSON scalar serialization for Isograph
  compatibility
- **Sample Recording**: Implemented `BfDeck.recordSample()` method for telemetry
  ingestion
- **Type System**: Added `TelemetryData` type definition and fixed all type
  casting issues
- **E2E Modernization**: Updated tests to use modern patterns (removed
  evaluate(), timeouts)
- **Test Context**: Added `reloadPage()` method to E2E test context
- **Sample Display**: SampleListItem component now parses and displays real
  telemetry data
- **All Tests Pass**: Complete pipeline validated with fastpitch-telemetry E2E
  test

## Next Steps

Phase 4 is mostly complete with PR #244. Remaining Phase 4 items:

- Sample detail view implementation
- Pagination for large sample lists
- Real-time updates for new samples

Ready to begin [Phase 5: Feedback Loop](./phase-5-feedback-loop.md) to enable
grading and improvement of AI responses.
