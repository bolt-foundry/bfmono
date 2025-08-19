# Open Questions

Questions we need to answer as we build the integration.

## Phase 1: Telemetry Visibility

- Are there any known issues preventing the data from showing up?
  - **Known issue:** Dashboard using mock data only, no GraphQL connection to
    real telemetry
  - **Known issue:** Router navigation breaks auth flow
    (router-navigation-auth-issue.md)

## Phase 2: Dashboard Integration

- What details are most important to show for each sample?
- Are there any performance metrics that matter for internal testing?
  - **Best guess:** Token usage and cost primary, latency secondary

## Phase 3: Feedback Loop

- How do we measure if feedback is actually improving outputs?

## Phase 4: Polish & Scale

- How do we prepare this for eventual customer use?
