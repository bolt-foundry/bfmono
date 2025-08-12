# E2E Deck-to-Grading Test Implementation

## Overview

Build an end-to-end test that tracks the complete flow from deck rendering
through sample creation to frontend grading. This tests the full platform
workflow from API key management through evaluation.

## Strategy

- Extend the existing eval.test.e2e.ts in boltfoundry-com
- Add comprehensive testing that exercises the full platform capabilities
- Build missing features (API key management page) as needed

## Prerequisites

### Required Before Implementation

1. **Phase 0 Completion** - API keys page must exist before Phase 1 can run
2. **Environment Setup**:
   - OpenAI API key configured
   - Test deck file selected and accessible

### To Be Implemented During Phases

1. **GraphQL Schema Updates** (not yet implemented):
   - Organization API key queries (implemented in Phase 0)
   - Sample state fields (approved/rejected/pending) - needs implementation
   - Grading mutations for persisting results - needs implementation
2. **Component Modifications** (partially complete):
   - Add `data-deck-id` and `data-sample-id` attributes to components
   - Replace hardcoded mock data in DeckList and SampleDisplay - still using
     mocks
   - Connect useGradingSamples hook to real GraphQL - not yet connected

### Current Limitations

- Grading actions only update local state (no persistence)
- Components use mock data with simulated GraphQL delays
- No GraphQL queries for grading samples implemented
- No mutations for saving grades implemented
- Missing connections between decks and samples in GraphQL
- Sample IDs may be difficult to track through telemetry

## Goals

- Track a deck render/sample gather from BfClient through to frontend grading
- Build incrementally, one part at a time
- Use authentication credentials from login to connect backend and frontend
  operations

## Shared Data

See [shared-data-spec.md](./shared-data-spec.md) for how data flows between
phases.

## Implementation Phases

**Important:** Phase 0 is a prerequisite that must be completed before other
phases can begin.

The implementation is split into separate phase documents for clarity:

### [Phase 0: Build API Keys Page](./phase-0-api-keys-page.md) (PREREQUISITE)

- Create /settings page with API key management
- Display organization API keys in copyable format
- GraphQL integration for fetching keys

### [Phase 1: Browser Login and Get API Key](./phase-1-browser-api-key.md)

- Extend eval test to navigate to settings after login
- Extract API key from the page
- Store for use in backend operations

### [Phase 2: Backend Sample Creation](./phase-2-backend-samples.md)

- Use BfClient with extracted API key
- Render test deck and create samples
- Send to telemetry endpoint

### [Phase 3: Frontend Grading Flow](./phase-3-frontend-grading.md)

- Navigate to eval page and find created deck
- Verify samples appear in grading interface
- Test grading actions and state updates

## Technical Details

### Test Location

`/internalbf/bfmono/apps/boltfoundry-com/__tests__/e2e/eval.test.e2e.ts`
(existing test to be extended)

### Key Components

- Browser automation setup from existing e2e tests
- BfClient usage pattern from telemetry test
- Deck rendering and sample creation
- Authentication flow handling
- Sample tracking through the system

### Research Findings

Based on codebase analysis, the following patterns and requirements have been
identified:

#### API Keys Page (Phase 0)

- **No existing /settings route** in BoltFoundry or BoltFoundry-Com apps
- **Design patterns available** from Contacts app EmailSettings component
- **BfDs components available**: Cards, Forms, Toggles, Modals, Toast
  notifications
- **GraphQL implementation needed**: No existing API key queries/mutations in
  bfDb

#### BfClient Usage (Phase 2)

- **Established pattern**: `BfClient.create({ apiKey: "bf+org-12345" })`
- **API key format**: `bf+{organizationId}` (e.g., `bf+dev-org:example.com`)
- **Integration pattern**: Pass `bfClient.fetch` to OpenAI or other LLM
  providers
- **Deck loading**: `readLocalDeck(path, { apiKey })` accepts optional API key
- **Environment fallback**: Can use `BF_API_KEY` environment variable

#### Mock Data Strategy (Phase 3)

- **Current state**: Components still use hardcoded mock data
- **GraphQL integration status**: Not yet implemented, components expect GraphQL
  but fall back to mocks
- **Testing approach**: Will need to implement GraphQL queries and mutations
  before mocks can be replaced

### Success Criteria

#### Currently Achievable

- Login completes and provides organization ID ✅
- Backend creates samples using BfClient with org-specific API key ✅
- Navigation through grading interface works ✅
- Frontend displays mock data in grading interface ✅

#### Future Goals (requires GraphQL implementation)

- API keys displayed in settings page from real data
- Samples created in backend appear in frontend grading
- Grading actions persist to database
- Full end-to-end sample lifecycle tracking

## Next Steps

1. **Complete Phase 0** - Implement API key management page
2. **Test Phases 1-3** - Verify the complete flow works
3. **Implement GraphQL integration** - Replace mocks with real data
4. **Add sample persistence** - Save grading results
5. **Enhance tracking** - Better sample ID management through the pipeline

## Files Modified

### Backend (bfDb)

- `/apps/bfDb/nodeTypes/BfApiKey.ts` - New API key node type
- `/apps/bfDb/nodeTypes/BfOrganization.ts` - Added apiKeys connection
- `/apps/bfDb/graphql/roots/Query.ts` - Added organizationApiKeys query
- `/apps/bfDb/graphql/__generated__/schema.graphql` - Generated schema updates
- `/apps/bfDb/models/__generated__/nodeTypesList.ts` - Added BfApiKey export

### Frontend (boltfoundry-com)

- `/components/Settings.tsx` - New API keys management page
- `/components/Nav.tsx` - Added Settings button
- `/routes.ts` - Added /settings route
- `/__tests__/e2e/eval.test.e2e.ts` - Extended test with phases 0-3

### Configuration

- `/deno.jsonc` - Updated Claude Code version
- `/deno.lock` - Updated dependencies

This implementation provides a solid foundation for end-to-end testing of the
Bolt Foundry platform, with room for future enhancements as GraphQL integration
becomes more complete.
