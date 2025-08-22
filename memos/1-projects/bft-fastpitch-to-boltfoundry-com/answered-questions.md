# Answered Questions

Questions we've resolved with decisions made.

## Product Decisions

**Q:** How often should Fastpitch run (hourly, daily, on-demand)?\
**A:** On-demand only, manually via `bft fastpitch` for testing

**Q:** Should users be able to trigger Fastpitch runs from the dashboard?\
**A:** No, Fastpitch is an internal testing tool, not a user-facing product

**Q:** Do we need real-time updates or is polling sufficient?\
**A:** Polling is fine - this is for internal testing, not production

**Q:** Does the dashboard require login/auth to view telemetry?\
**A:** Basic access is enough for now - this is internal testing

**Q:** How do we handle tenant isolation for multiple customers?\
**A:** Not needed yet - this is for internal testing only

## Technical Decisions (from codebase investigation)

**Q:** Are there any authentication/permission issues blocking access?\
**A:** No blocking issues. Telemetry uses simple API key auth (bf+orgId format)\
which works correctly. The endpoint validates the key and creates a\
CurrentViewer for the organization.

**Q:** What's the data flow from fastpitch to storage to dashboard?\
**A:** No current flow exists. Will be: fastpitch → BfClient → telemetry\
endpoint → BfSample/BfDeck in bfDb → Isograph → dashboard

**Q:** Where is telemetry data currently going when you run `bft fastpitch`?\
**A:** To boltfoundry.com via POST https://boltfoundry.com/api/telemetry\
endpoint (packages/bolt-foundry/BfClient.ts,\
apps/boltfoundry-com/handlers/telemetry.ts)

**Q:** What telemetry data is being sent?\
**A:** Complete OpenAI request/response, duration, provider, model, deck\
metadata with contextVariables (packages/bolt-foundry/types.ts)

**Q:** What format is the telemetry in?\
**A:** JSON with OpenAI-compatible format, stored as completionData in BfSample\
nodes (apps/bfDb/nodeTypes/rlhf/BfSample.ts)

**Q:** Is telemetry using the bfclient library?\
**A:** Yes, BfClient wraps fetch() to automatically capture telemetry\
(infra/bft/tasks/fastpitch.bft.ts lines 82-103)

**Q:** Can we send telemetry to local endpoints for development?\
**A:** Yes, BfClient accepts collectorEndpoint config parameter that can be set\
to localhost (packages/bolt-foundry/BfClient.ts)

**Q:** Which app should we modify - boltfoundry.com or boltFoundry?\
**A:** boltfoundry.com - it has the telemetry handler, evaluation dashboard,\
and\
routing infrastructure (apps/boltfoundry-com/)

**Q:** Do we need to create a new bfDb entity for Fastpitch runs?\
**A:** No, not needed - use existing BfSample and BfDeck entities

**Q:** Is GraphQL required or can we use direct database access?\
**A:** GraphQL is strongly recommended - follows existing patterns, automatic\
schema generation, type safety

**Q:** Should telemetry be immutable once written?\
**A:** Currently not immutable but should be - recommend append-only pattern\
with audit trail

**Q:** Is there existing telemetry infrastructure we can reuse?\
**A:** Yes, complete infrastructure: BfClient, telemetry handler,\
BfSample/BfDeck storage, integration tests

**Q:** How do we differentiate Fastpitch telemetry from other telemetry?\
**A:** Through deckId ("fastpitch-curator"), contextVariables, and bfMetadata\
fields

**Q:** Should we use Isograph for dashboard UI components?\
**A:** Yes, follow existing patterns in apps/boltfoundry-com/components/Eval.tsx

**Q:** How should telemetry be displayed?\
**A:** Hybrid cards + list approach using BfDsCard and BfDsList components\
(apps/bfDs/)

**Q:** Do we store feedback in the same place as telemetry?\
**A:** Separate but related - BfSampleFeedback nodes link to BfSample nodes via\
relationships

**Q:** Should feedback be simple or detailed?\
**A:** Use -3 to +3 scale for evaluation

**Q:** How do we connect feedback to specific Fastpitch outputs?\
**A:** Via contextVariables (digest\_story\_id, story\_type) and BfSample\
relationships

**Q:** Should we track feedback provider identity?\
**A:** Yes, via CurrentViewer system - tracks personBfGid and orgBfOid

**Q:** Should feedback be versioned with the model/prompt used?\
**A:** Yes, add modelUsed and promptVersion fields to BfGraderResult

**Q:** How does viewing telemetry lead to improving AI responses?\
**A:** Telemetry → BfSample creation → automatic/manual grading → feedback\
analysis → deck refinement → improved prompts

**Q:** What's the connection between telemetry and grading?\
**A:** BfSample stores telemetry, BfGraderResult stores automatic grading,\
BfSampleFeedback stores manual grading

**Q:** Where do telemetry samples appear in the dashboard?\
**A:** BfSamples appear as part of decks in the existing decks view pages\
(/pg/grade/decks/:deckId)

**Q:** Should we show all telemetry or just Fastpitch-specific data?\
**A:** Filter deck by deck - each deck view shows its own samples

**Q:** How do we turn feedback into evaluation specs?\
**A:** Disagreement analysis → pattern identification → deck spec updates →\
grader retraining (apps/aibff/commands/calibrate.ts)

**Q:** How do we handle telemetry from failed/incomplete runs?\
**A:** Telemetry failures are silently ignored to not block main operations,\
logged for debugging

**Q:** What happens if telemetry storage fails?\
**A:** BfClient catches and ignores errors, handler logs errors but returns\
success, SQLite has retry logic

**Q:** How do we handle concurrent Fastpitch runs?\
**A:** Not a concern - manual testing only, no need for concurrency handling

**Q:** How do we archive old telemetry data?\
**A:** Future concern, not needed for internal testing phase

**Q:** What analytics/KPIs should we track for internal testing?\
**A:** None for MVP - will address later

**Q:** How do we handle large content (full articles) in telemetry storage?\
**A:** Future concern, not needed for MVP

**Q:** What constitutes "good" vs "bad" Fastpitch output?\
**A:** Good: Major engineering impact, breaking changes, actionable info. Bad:\
Business news, minor updates, opinion pieces

**Q:** What's the minimum viable "it's working"?\
**A:** Raw JSON with 5 valid stories showing in dashboard proves core AI\
curation is functional

## Phase 3: UI/UX Implementation Decisions

**Q:** Where should Isograph components be stored in the file system?\
**A:** There are three directories with different purposes:

- `apps/boltfoundry-com/components/` - Regular React "dumb" components that can\
  be imported directly (layout components, UI components, etc.)
- `apps/boltfoundry-com/isograph/components/[GraphQLType]/ComponentName.tsx` -\
  Isograph components organized by the GraphQL type they attach to. For\
  example:\
  `isograph/components/Query/PromptGrade.tsx` for a component that's a field on\
  Query
- `apps/boltfoundry-com/isograph/entrypoints/` - Isograph entrypoints that\
  handle routing and top-level data fetching

**Q:** Is there already an existing nav component we need to convert to\
Isograph, or are we creating a new one?\
**A:** There is an existing Nav component at\
`/apps/boltfoundry-com/components/Nav.tsx` that needs to be converted to\
Isograph. It currently has logo, external links, login button, and mobile menu\
functionality.

**Q:** Which GraphQL type should the navigation component attach to - Query,\
Organization, or CurrentViewer?\
**A:** **Query** is most appropriate because the nav component will be used in\
many different contexts throughout the app. It can still access currentViewer\
through the Query type for authentication state and organization data.

**Q:** Should we maintain the CurrentViewerLoggedIn/LoggedOut pattern exactly\
as\
is, or is there a preferred Isograph way?\
**A:** **Maintain the existing pattern** - this IS the preferred Isograph way.\
It provides GraphQL-level security, type safety, and follows best practices.\
The\
pattern uses type-safe conditional access with `asCurrentViewerLoggedIn` and\
`asCurrentViewerLoggedOut`.

**Q:** Are we keeping the same routes (`/pg/grade/*`, `/pg/analyze`,\
`/pg/chat`)\
or changing anything?\
**A:** Keep the same routes. `/pg/grade/*` is working. `/pg/analyze` and\
`/pg/chat` have components built but need their route entrypoints created and\
uncommented in routes.ts.

**Q:** Where do the E2E tests live? Should we update existing ones or create\
new\
test files?\
**A:** E2E tests live in `/apps/boltfoundry-com/__tests__/e2e/`. **Update**\
**existing tests**, particularly `fastpitch-telemetry.test.e2e.ts` for\
dashboard\
integration and `eval.test.e2e.ts` for deck UI testing.

**Q:** When PromptGrade needs to reference other components (like the nav),\
should it follow the pattern from the Isograph docs where components reference\
each other as fields?\
**A:** **Yes, absolutely.** PromptGrade should reference Nav as a field in its\
Isograph query (e.g., `field Query.PromptGrade @component { Nav }`), not import\
it directly. This follows the "resolvers all the way down" philosophy.

## Backend Phase: Node Query Pattern - RESOLVED QUESTIONS

**Q:** Does our current GraphQL schema properly implement the Node interface\
for\
BfDeck and BfSample?\
**A:** **NO.** BfDeck and BfSample implement BfNode interface, NOT the standard\
Node interface. Two separate interface hierarchies exist:

- Standard GraphQL Node interface (used by BlogPost, GithubRepoStats,\
  PublishedDocument)
- Bolt Foundry BfNode interface (used by BfDeck, BfSample) Source:\
  `/internalbf/bfmono/apps/bfDb/graphql/__generated__/schema.graphql`,\
  `/internalbf/bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts`,\
  `/internalbf/bfmono/apps/bfDb/nodeTypes/rlhf/BfSample.ts`

**Q:** Do we have the `node(id: ID!): Node` query implemented in the backend?\
**A:** **NO.** The standard Node query is NOT implemented in the Query root.\
Current Query root only has: ok, documentsBySlug, blogPost, blogPosts,\
githubRepoStats, deck (by slug), and currentViewer.\
Source: `/internalbf/bfmono/apps/bfDb/graphql/roots/Query.ts`

**Q:** Are the `asBfDeck` and `asBfSample` type casting operations available?\
**A:** **NO.** These patterns do not exist in the implementation - only found\
in planning memos. Would need to be implemented as part of BfNode pattern
migration.\
Source: Searched entire codebase - only references in\
`/internalbf/bfmono/memos/1-projects/bft-fastpitch-to-boltfoundry-com/backend-node-query-pattern.md`

**Q:** Should we implement Node interface on BfDeck/BfSample directly, or create
a unified interface that bridges BfNode and Node?\
**A:** **Use existing BfNode interface.** Since BfDeck and BfSample already
implement BfNode interface, we should create a `bfNode(id: ID!): BfNode` query
rather than trying to bridge two interface hierarchies. This leverages existing
infrastructure and follows established patterns.\
Source: Research findings + backend-node-query-pattern.md updated approach

**Q:** How should we pass route parameters (like `tab`) to Isograph components?\
**A:** **Two established patterns:**

1. **For Entrypoints:** Access via `props.parameters` (route params passed from\
   AppRoot)
2. **For Regular Components:** Use `useRouter()` hook to access `routeParams`\
   and `queryParams` Example: DeckDetailView uses\
   `const { routeParams } = useRouter(); const currentTab = routeParams.tab`\
   Source:\
   `/internalbf/bfmono/apps/boltfoundry-com/isograph/components/BfDeck/DeckDetailView.tsx`,\
   `/internalbf/bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx`

**Q:** How does Isograph handle loading states for node queries?\
**A:** **React Suspense pattern** with `throw promise` mechanism. Isograph uses\
`useResult` hook which calls `maybeUnwrapNetworkRequest` with\
`suspendIfInFlight: true` to trigger Suspense boundaries. Components assume\
Suspense boundary exists higher up.\
Source:\
`/internalbf/bfmono/apps/boltfoundry-com/lib/BfIsographFragmentReader.tsx`

**Q:** What's the caching strategy for frequently accessed entities?\
**A:** **Global store pattern** with `createIsographStore()` and\
`createIsographEnvironment()`. Cache shared across components via\
`IsographEnvironmentProvider`. Client uses global singleton, server creates\
fresh store per request. Fragment-level caching with automatic deduplication.\
Source: `/internalbf/bfmono/apps/boltfoundry-com/isographEnvironment.ts`,\
`/internalbf/bfmono/apps/boltfoundry-com/server/isographEnvironment.ts`

**Q:** How should we handle "node not found" vs "node exists but wrong type"?\
**A:** **Use BfDsEmptyState component consistently:**

- **Node not found:** `BfDsEmptyState` with "Content not found" title and "Go\
  Home" action
- **Wrong type:** `BfDsEmptyState` with "Unsupported content type" title and\
  "Go\
  Back" action\
  Pattern established in existing components like DeckSamplesList.\
  Source:\
  `/internalbf/bfmono/apps/boltfoundry-com/isograph/components/BfDeck/DeckSamplesList.tsx`

**Q:** Should we feature-flag the new Node pattern during migration?\
**A:** **Use environment-based toggles and hook-based migration.** Established\
patterns include:

- Environment-based feature flags (like `shouldUseGoogleAuthDevMock()`)
- Hook-based migration that maintains interface compatibility
- Wrapper components that bridge prop-based and Isograph patterns Source:\
  `/internalbf/bfmono/apps/boltfoundry-com/utils/googleAuthDevMock.ts`,\
  `/internalbf/bfmono/apps/boltfoundry-com/hooks/useIsographDeckSamples.ts`

**Q:** Are there query complexity concerns with the node pattern?\
**A:** **Low concern based on current implementation.** Isograph already uses\
lazy loading via `useLazyReference`, fragment composition for efficient\
queries,\
and automatic caching. Bundle size impact minimal due to fragment reuse in\
`__generated__/` directory.\
Source: `/internalbf/bfmono/apps/boltfoundry-com/AppRoot.tsx`

## Phase 1: Telemetry Visibility - RESOLVED QUESTIONS

**Q:** Are there any known issues preventing the data from showing up?\
**A:** **RESOLVED:** Dashboard loads mock data in `useDeckSamples` hook instead\
of real GraphQL data. The issue is in\
apps/boltfoundry-com/hooks/useDeckSamples.ts:41-54 where mock data is returned\
instead of fetching real telemetry data.\
**Known issue:** Router navigation breaks auth flow (documented in\
router-navigation-auth-issue.md)

## Phase 2: Dashboard Integration - RESOLVED QUESTIONS

**Q:** Are there any performance metrics that matter for internal testing?\
**A:** **Token usage and cost are primary metrics, latency is secondary.** For\
internal testing, focus on understanding AI model costs and token consumption\
patterns rather than real-time performance metrics.
