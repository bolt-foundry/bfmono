# Phase 2: Backend Sample Creation

## Overview

Use the API key extracted in Phase 1 to create BfClient instance and generate
samples that will appear in the frontend grading interface.

## Requirements

- Create BfClient with extracted API key
- Load and render a test deck
- Create BfSamples from the output
- Send samples to telemetry endpoint
- Track created sample IDs for verification

## Implementation Details

### Research Findings

- **BfClient pattern**: `BfClient.create({ apiKey: "bf+org-12345" })`
- **API key format**: `bf+{organizationId}` (e.g., `bf+dev-org:example.com`)
- **Telemetry endpoint**: Default is production, can override with
  `collectorEndpoint`
- **Integration test example**:
  `/internalbf/bfmono/packages/bolt-foundry/__tests__/integration.test.ts`
- **Deck loading**: Use `readLocalDeck()` function with optional apiKey
  parameter

### Shared Data

**Expects from previous phases:**

- `extractedApiKey: string` - API key from Phase 1
- `SAMPLE_INVOICE_TEXT: string` - Test fixture loaded at module level

**Provides to next phases:**

- `createdDeckId: string` - ID of the deck that was rendered
- `createdSampleId: string` - ID of the created sample

See [shared-data-spec.md](./shared-data-spec.md) for complete data flow.

### Add Backend Operations to Test

1. **Import Required Modules**
   ```typescript
   import { BfClient } from "@bfmono/packages/bolt-foundry/BfClient.ts";
   import { readLocalDeck } from "@bfmono/packages/bolt-foundry/deck.ts";
   import type { Deck } from "@bfmono/packages/bolt-foundry/deck.ts";
   ```

2. **Create BfClient Instance**
   ```typescript
   await t.step("Create samples using BfClient", async () => {
     // Use the static create method (preferred pattern)
     const bfClient = BfClient.create({
       apiKey: extractedApiKey, // from Phase 1
     });

     // Load a test deck (readLocalDeck is a standalone function)
     const deck = await readLocalDeck("/path/to/test.deck.md", {
       apiKey: extractedApiKey,
     });
   });
   ```

3. **Render Deck and Create Samples**
   ```typescript
   // Note: BfClient is primarily for wrapping LLM calls with telemetry
   // For creating samples directly, you might need to:
   // 1. Use an LLM provider with BfClient.fetch for automatic telemetry
   // 2. Or manually send samples to the telemetry endpoint

   // Example with OpenAI (following integration test pattern):
   import { OpenAI } from "openai";

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
     fetch: bfClient.fetch, // This captures telemetry
   });

   // Render deck with OpenAI
   const completion = await deck.render({
     llmCompletionFn: async (messages) => {
       const response = await openai.chat.completions.create({
         model: "gpt-4o-mini",
         messages,
       });
       return response.choices[0].message.content;
     },
     context: { invoice_text: SAMPLE_INVOICE_TEXT },
   });
   ```

4. **Track Created Data**
   ```typescript
   // When using BfClient.fetch with an LLM provider,
   // telemetry is automatically sent to the endpoint

   // For this test, we need to track what was created
   // This might require:
   // 1. Intercepting the telemetry response
   // 2. Or querying the GraphQL API to find the created samples
   // 3. Or using the deck ID from the loaded deck

   createdDeckId = deck.id || deck.metadata?.id;
   // createdSampleId would need to be extracted from telemetry response
   // or queried from the API after creation
   ```

### Test Deck Selection

Options for test deck:

1. Use existing invoice extraction deck
2. Create a simple test deck specifically for e2e
3. Use a minimal "echo" deck that returns input

### Data Management

- Store created sample IDs for Phase 3 verification
- Track deck ID for navigation in UI
- Consider cleanup after test completes

## Success Criteria

- [ ] BfClient successfully created with API key
- [ ] Test deck loaded and rendered
- [ ] Sample created with proper format
- [ ] Telemetry endpoint accepts sample
- [ ] Sample ID and deck ID captured for verification

## Dependencies

- Phase 1 must provide valid API key
- Telemetry endpoint must be running
- Test deck must be available

## Next Steps

Phase 3 will navigate to the eval page and verify these created samples appear
in the grading interface.
