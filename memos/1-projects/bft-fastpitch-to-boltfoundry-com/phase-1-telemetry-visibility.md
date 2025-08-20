# Phase 1: Telemetry Visibility ✅ COMPLETED

## Objective

Get Fastpitch telemetry data visible in the Bolt Foundry dashboard.

## Current State (Discovered)

- ✅ `bft fastpitch` runs and generates telemetry
- ✅ Telemetry is sent to `/api/telemetry` endpoint
- ✅ Data is stored as BfDeck and BfSample entities in bfDb
- ✅ Dashboard deck views exist at `/pg/grade/decks/:deckId`
- ❌ Dashboard loads mock data instead of real telemetry

## Root Cause

The dashboard's `useDeckSamples` hook
(apps/boltfoundry-com/hooks/useDeckSamples.ts:41-54) hardcodes loading mock data
instead of fetching real samples from GraphQL.

## Implementation Tasks

### 1. Verify GraphQL Schema ✅

- [x] Confirm BfDeck.samples connection returns expected data
- [x] Ensure BfSample fields match dashboard requirements
- [x] Add HUD button "Test GraphQL Samples" that fetches deck samples and
      displays results
- [x] Create e2e test that logs in, opens HUD, clicks button, verifies results

**Findings:**

- GraphQL errors discovered:
  1. `deck` field doesn't accept an `id` argument (needs to use different query
     pattern)
  2. `BfSample` doesn't have a `createdAt` field (should use
     `metadata.createdAt` or remove)
- HUD button successfully tests GraphQL endpoint
- Error messages display with 1-second delays for readability
- E2E test navigates through all error messages using smoothClick

**Verification:**

```bash
# Start the dashboard (includes GraphQL handler at /graphql)
bft dev boltfoundry-com

# Run e2e test that logs in and verifies GraphQL samples endpoint
bft e2e apps/boltfoundry-com/__tests__/e2e/graphql-samples.test.e2e.ts

# The test will:
# 1. Use withIsolatedDb() for a clean test database
# 2. Start a browser session with annotated video recording
# 3. Use smoothUi to navigate to http://localhost:8000
# 4. Use smoothUi to log in with test credentials
# 5. Open the HUD with window._bfdebug_.showHud()
# 6. Use smoothUi to click the "Test GraphQL Samples" button in the HUD
# 7. View the GraphQL query results displayed in the HUD output
# 8. Close HUD with window._bfdebug_.hideHud()
# 9. Verify the response contains BfDeck with samples

# OR manually verify in browser:
# 1. Navigate to http://localhost:8000 and log in
# 2. Open browser console and run: window._bfdebug_.showHud()
# 3. Click the "Test GraphQL Samples" button
# 4. The HUD will fetch deck samples from GraphQL and display results
# 5. Close with: window._bfdebug_.hideHud()
```

✅ **Success:** Query returns deck with samples containing completionData

### 2. Update Isograph Query ✅

- [x] Fixed GraphQL query to use `currentViewer` → `organization` → `decks`
      connection
- [x] Used inline fragment for `CurrentViewerLoggedIn` interface implementation
- [x] Query successfully fetches organization and deck data from GraphQL
      endpoint
- [x] Removed invalid `createdAt` field reference from BfSample query

**Verification:**

```bash
# If bft dev boltfoundry-com is running, Isograph will auto-compile on file changes
# Check the dev server logs for compilation errors:
tail -f /tmp/boltfoundry-com-dev.log

# Or manually compile:
bft iso

# Verify generated files updated in __generated__/__isograph/
```

✅ **Success:** Isograph compiles without errors and generates sample fields

### 3. Replace Mock Data Loading ✅

- [x] Updated Eval component to fetch samples via Isograph query
- [x] Modified EvalProvider to accept and process GraphQL deck data
- [x] Updated `useDeckSamples` hook to use GraphQL data from context
- [x] Added fallback to mock data for backward compatibility
- [x] Successfully compiled Isograph schema with samples connection

**Verification:**

```bash
# Run e2e test to verify the UI shows real data
bft e2e apps/boltfoundry-com/__tests__/e2e/fastpitch-ui.test.e2e.ts

# The test will:
# 1. Use withIsolatedDb() for a clean test database
# 2. Start a browser session with annotated video recording
# 3. Import and run fastpitch.generate() from infra/bft/tasks/fastpitch.bft.ts
# 4. Use smoothUi to log in to the dashboard
# 5. Use smoothUi to navigate to /pg/grade/decks/fastpitch
# 6. Verify samples are displayed in the deck view
# 7. Check that the samples contain actual fastpitch telemetry data
# 8. Confirm timestamps match the generation from step 3
```

✅ **Success:** Fastpitch samples appear in the deck view UI with real telemetry
data

## Success Criteria

- [x] Can run `bft fastpitch` ✅
- [x] GraphQL endpoint successfully queries deck samples ✅
- [x] Dashboard can fetch real telemetry data via GraphQL ✅
- [x] Telemetry appears in dashboard ✅ (Completed in PR #190)
- [x] Can see basic run information (timestamp, status, outputs) ✅ (Completed
      in PR #190)

## Next Phase

Once telemetry is visible, proceed to
[Phase 2: Dashboard Integration](./phase-2-dashboard-integration.md)
