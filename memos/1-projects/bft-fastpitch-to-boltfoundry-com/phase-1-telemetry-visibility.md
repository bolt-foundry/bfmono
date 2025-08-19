# Phase 1: Telemetry Visibility

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

### 1. Verify GraphQL Schema

- [ ] Confirm BfDeck.samples connection returns expected data
- [ ] Ensure BfSample fields match dashboard requirements
- [ ] Add HUD button "Test GraphQL Samples" that fetches deck samples and
      displays results
- [ ] Create e2e test that logs in, opens HUD, clicks button, verifies results

**Verification:**

```bash
# Start the dashboard (includes GraphQL handler at /graphql)
bft dev boltfoundry-com

# Run e2e test that logs in and verifies GraphQL samples endpoint
bft e2e apps/boltfoundry-com/__tests__/e2e/graphql-samples.test.e2e.ts

# The test will:
# 1. Start a browser session with video recording
# 2. Navigate to http://localhost:8000
# 3. Log in using test credentials
# 4. Open the HUD with window._bfdebug_.showHud()
# 5. Click the "Test GraphQL Samples" button in the HUD
# 6. View the GraphQL query results displayed in the HUD output
# 7. Close HUD with window._bfdebug_.hideHud()
# 8. Verify the response contains BfDeck with samples

# OR manually verify in browser:
# 1. Navigate to http://localhost:8000 and log in
# 2. Open browser console and run: window._bfdebug_.showHud()
# 3. Click the "Test GraphQL Samples" button
# 4. The HUD will fetch deck samples from GraphQL and display results
# 5. Close with: window._bfdebug_.hideHud()
```

✅ **Success:** Query returns deck with samples containing completionData

### 2. Update Isograph Query

- [ ] Modify `apps/boltfoundry-com/components/Eval.tsx` to fetch deck samples
- [ ] Add samples connection with proper fields to the GraphQL query
- [ ] Pass deck samples data through to components

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

### 3. Replace Mock Data Loading

- [ ] Update `useDeckSamples` hook to use Isograph queries
- [ ] Remove hardcoded mock data imports
- [ ] Map GraphQL response to `GradingSample` type structure

**Verification:**

```bash
# Run e2e test to verify the UI shows real data
bft e2e apps/boltfoundry-com/__tests__/e2e/fastpitch-ui.test.e2e.ts

# The test will:
# 1. Import and run fastpitch.generate() from infra/bft/tasks/fastpitch.bft.ts
# 2. Log in to the dashboard
# 3. Navigate to /pg/grade/decks/fastpitch
# 4. Verify samples are displayed in the deck view
# 5. Check that the samples contain actual fastpitch telemetry data
# 6. Confirm timestamps match the generation from step 1
```

✅ **Success:** Fastpitch samples appear in the deck view UI with real telemetry
data

## Success Criteria

- [ ] Can run `bft fastpitch`
- [ ] Telemetry appears in dashboard
- [ ] Can see basic run information (timestamp, status, outputs)

## Next Phase

Once telemetry is visible, proceed to
[Phase 2: Dashboard Integration](./phase-2-dashboard-integration.md)
