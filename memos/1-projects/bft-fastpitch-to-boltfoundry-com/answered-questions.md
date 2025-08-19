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
**A:** No blocking issues. Telemetry uses simple API key auth (bf+orgId format)
which works correctly. The endpoint validates the key and creates a
CurrentViewer for the organization.

**Q:** What's the data flow from fastpitch to storage to dashboard?\
**A:** No current flow exists. Will be: fastpitch → BfClient → telemetry
endpoint → BfSample/BfDeck in bfDb → Isograph → dashboard

**Q:** Where is telemetry data currently going when you run `bft fastpitch`?\
**A:** To boltfoundry.com via POST https://boltfoundry.com/api/telemetry
endpoint (packages/bolt-foundry/BfClient.ts,
apps/boltfoundry-com/handlers/telemetry.ts)

**Q:** What telemetry data is being sent?\
**A:** Complete OpenAI request/response, duration, provider, model, deck
metadata with contextVariables (packages/bolt-foundry/types.ts)

**Q:** What format is the telemetry in?\
**A:** JSON with OpenAI-compatible format, stored as completionData in BfSample
nodes (apps/bfDb/nodeTypes/rlhf/BfSample.ts)

**Q:** Is telemetry using the bfclient library?\
**A:** Yes, BfClient wraps fetch() to automatically capture telemetry
(infra/bft/tasks/fastpitch.bft.ts lines 82-103)

**Q:** Can we send telemetry to local endpoints for development?\
**A:** Yes, BfClient accepts collectorEndpoint config parameter that can be set
to localhost (packages/bolt-foundry/BfClient.ts)

**Q:** Which app should we modify - boltfoundry.com or boltFoundry?\
**A:** boltfoundry.com - it has the telemetry handler, evaluation dashboard, and
routing infrastructure (apps/boltfoundry-com/)

**Q:** Do we need to create a new bfDb entity for Fastpitch runs?\
**A:** No, not needed - use existing BfSample and BfDeck entities

**Q:** Is GraphQL required or can we use direct database access?\
**A:** GraphQL is strongly recommended - follows existing patterns, automatic
schema generation, type safety

**Q:** Should telemetry be immutable once written?\
**A:** Currently not immutable but should be - recommend append-only pattern
with audit trail

**Q:** Is there existing telemetry infrastructure we can reuse?\
**A:** Yes, complete infrastructure: BfClient, telemetry handler,
BfSample/BfDeck storage, integration tests

**Q:** How do we differentiate Fastpitch telemetry from other telemetry?\
**A:** Through deckId ("fastpitch-curator"), contextVariables, and bfMetadata
fields

**Q:** Should we use Isograph for dashboard UI components?\
**A:** Yes, follow existing patterns in apps/boltfoundry-com/components/Eval.tsx

**Q:** How should telemetry be displayed?\
**A:** Hybrid cards + list approach using BfDsCard and BfDsList components
(apps/bfDs/)

**Q:** Do we store feedback in the same place as telemetry?\
**A:** Separate but related - BfSampleFeedback nodes link to BfSample nodes via
relationships

**Q:** Should feedback be simple or detailed?\
**A:** Use -3 to +3 scale for evaluation

**Q:** How do we connect feedback to specific Fastpitch outputs?\
**A:** Via contextVariables (digest_story_id, story_type) and BfSample
relationships

**Q:** Should we track feedback provider identity?\
**A:** Yes, via CurrentViewer system - tracks personBfGid and orgBfOid

**Q:** Should feedback be versioned with the model/prompt used?\
**A:** Yes, add modelUsed and promptVersion fields to BfGraderResult

**Q:** How does viewing telemetry lead to improving AI responses?\
**A:** Telemetry → BfSample creation → automatic/manual grading → feedback
analysis → deck refinement → improved prompts

**Q:** What's the connection between telemetry and grading?\
**A:** BfSample stores telemetry, BfGraderResult stores automatic grading,
BfSampleFeedback stores manual grading

**Q:** Where do telemetry samples appear in the dashboard?\
**A:** BfSamples appear as part of decks in the existing decks view pages
(/pg/grade/decks/:deckId)

**Q:** Should we show all telemetry or just Fastpitch-specific data?\
**A:** Filter deck by deck - each deck view shows its own samples

**Q:** How do we turn feedback into evaluation specs?\
**A:** Disagreement analysis → pattern identification → deck spec updates →
grader retraining (apps/aibff/commands/calibrate.ts)

**Q:** How do we handle telemetry from failed/incomplete runs?\
**A:** Telemetry failures are silently ignored to not block main operations,
logged for debugging

**Q:** What happens if telemetry storage fails?\
**A:** BfClient catches and ignores errors, handler logs errors but returns
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
**A:** Good: Major engineering impact, breaking changes, actionable info. Bad:
Business news, minor updates, opinion pieces

**Q:** What's the minimum viable "it's working"?\
**A:** Raw JSON with 5 valid stories showing in dashboard proves core AI
curation is functional
