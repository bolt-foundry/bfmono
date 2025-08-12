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
2. **GraphQL Schema Updates**:
   - Organization API key queries (Phase 0)
   - Sample state fields (approved/rejected/pending)
   - Grading mutations for persisting results
3. **Component Modifications**:
   - Add `data-deck-id` and `data-sample-id` attributes to components
   - Replace hardcoded mock data in DeckList and SampleDisplay
   - Connect useGradingSamples hook to real GraphQL
4. **Environment Setup**:
   - OpenAI API key configured
   - Test deck file selected and accessible

### Current Limitations

- Grading actions only update local state (no persistence)
- Components use mock data with simulated GraphQL delays
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

- **Complete replacement approach**: No backward compatibility needed
- **Current state**: Components use hardcoded mocks, expecting GraphQL
  integration
- **Testing philosophy**: Replace mocks entirely rather than maintaining dual
  systems

### Success Criteria

#### Currently Achievable

- Login completes and provides organization ID ✅
- Backend creates samples using BfClient with org-specific API key ✅
- Frontend displays the created samples (with mock data) ✅
- Navigation through grading interface works ✅

#### Requires Additional Implementation

- Grading actions persist to database ❌ (currently local state only)
- Real samples appear in frontend ❌ (requires GraphQL integration)
- Sample state tracking across page reloads ❌ (no persistence)
- Full end-to-end data flow ❌ (missing GraphQL connections)

## Changes to Existing Eval Test

The current eval.test.e2e.ts tests:

1. Navigate to homepage and login
2. Navigate to eval page
3. Verify deck list loads (currently with mock data)
4. Click on deck and verify grading inbox (currently disabled)

We will extend it to:

1. After login, navigate to /settings to get API key
2. Use BfClient to create real samples with that API key
3. Navigate to eval page and verify real samples appear
4. Test actual grading functionality

## Current Status

- [x] Requirements gathered
- [x] Implementation plan updated
- [ ] Phase 0: Build API keys page
- [ ] Phase 1: Extend eval test to get API key
- [ ] Phase 2: Add backend sample creation
- [ ] Phase 3: Update frontend grading flow
