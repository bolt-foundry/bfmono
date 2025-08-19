# Phase 1: Telemetry Visibility

## Objective

Get Fastpitch telemetry data visible in the Bolt Foundry dashboard.

## Current State

- `bft fastpitch` runs and generates telemetry
- Telemetry is being sent somewhere
- Dashboard exists but doesn't show the data

## Tasks

### Discovery

- [ ] Map current telemetry flow from Fastpitch
- [ ] Identify where telemetry is stored (bfDb, API, file system)
- [ ] Understand telemetry data format and structure
- [ ] Find what's blocking dashboard visibility

### Implementation

- [ ] Create minimal dashboard view for telemetry
- [ ] Connect view to telemetry data source
- [ ] Display basic telemetry information
- [ ] Verify data appears when running `bft fastpitch`

## Success Criteria

- [ ] Can run `bft fastpitch`
- [ ] Telemetry appears in dashboard
- [ ] Can see basic run information (timestamp, status, outputs)

## Next Phase

Once telemetry is visible, proceed to
[Phase 2: Dashboard Integration](./phase-2-dashboard-integration.md)
