# Phase 4: Telemetry Integration

## Objective

Wire up BfClient telemetry to track all AI calls and enable RLHF workflows.

## Existing Infrastructure

### BfClient (`packages/bolt-foundry/BfClient.ts`)

- Wraps fetch() to intercept AI calls
- Auto-sends telemetry to `boltfoundry.com/api/telemetry`
- Creates BfDeck and BfSample records

### Usage Pattern

```typescript
import { BfClient } from "@bfmono/packages/bolt-foundry/BfClient.ts";
import OpenAI from "openai";

const client = new BfClient({
  apiKey: Deno.env.get("FASTPITCH_BF_API_KEY") || "bf+test-org",
});

// Configure OpenAI client to use OpenRouter with BfClient's fetch for telemetry
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENROUTER_API_KEY"),
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://boltfoundry.com",
    "X-Title": "Fastpitch",
  },
  fetch: client.fetch, // Use BfClient's fetch for telemetry tracking
});

// TODO: Implement client.readDeckFromPath() method
// Read deck from disk via client
const deck = await client.readDeckFromPath(
  "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md",
);

// Render deck with context
const request = deck.render({
  stories: storiesArray,
  // other context variables from contexts.toml
});

// Execute via OpenAI client (telemetry tracked via BfClient's fetch)
const completion = await openai.chat.completions.create(request);
```

## Integration Points

### 1. Deck Execution

Complete flow in fastpitch.bft.ts:

```typescript
// In fastpitch.bft.ts
import OpenAI from "openai";

async function generateSummaries(args: Array<string>) {
  const client = new BfClient({
    apiKey: Deno.env.get("FASTPITCH_BF_API_KEY") || "bf+fastpitch",
  });

  // Configure OpenAI client for OpenRouter with BfClient's fetch
  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENROUTER_API_KEY"),
    baseURL: Deno.env.get("OPENROUTER_BASE_URL") ||
      "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://boltfoundry.com",
      "X-Title": "Fastpitch",
    },
    fetch: client.fetch, // Use BfClient's fetch for telemetry
  });

  // Load stories from CSV file
  import { parse } from "@std/csv";
  const csvContent = await Deno.readTextFile(args.input);
  const stories = parse(csvContent, { skipFirstRow: true }); // Parse CSV with @std/csv

  // Load deck via client
  const deck = await client.readDeckFromPath(
    "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md",
  );

  // Render deck with context
  const request = deck.render({
    stories: stories,
    // additional context from contexts.toml
  });

  // Execute via OpenAI client (telemetry tracked automatically)
  const completion = await openai.chat.completions.create(request);

  // Process and output results
  console.log(JSON.stringify(completion.choices[0].message));
}
```

### 2. Telemetry Metadata

The deck itself contains metadata that gets included with telemetry
automatically. No additional setup needed - BfClient handles this when
processing the deck.

### 3. Local Testing Setup

For local development:

```bash
# Set test API key
export FASTPITCH_BF_API_KEY=bf+test-org

# Point telemetry to local BoltFoundry instance
export FASTPITCH_BF_TELEMETRY_URL=http://localhost:8000/api/telemetry

# Or disable telemetry for testing
export FASTPITCH_BF_TELEMETRY_ENABLED=false
```

## Telemetry Data Flow

```
Fastpitch Task
    ↓
BfClient.fetch()
    ↓
Intercept AI Call
    ↓
Send to boltfoundry.com/api/telemetry
    ↓
Create BfDeck & BfSample records
    ↓
Available for RLHF evaluation
```

## Implementation Checklist

### 1. Add BfClient Method

- [ ] Implement `client.readDeckFromPath()` method in BfClient
- [ ] Method should read deck file and return Deck instance
- [ ] Deck instance should have `.render()` method

### 2. Update Deck Runner

- [ ] Import BfClient in fastpitch.bft.ts
- [ ] Use `client.readDeckFromPath()` to load deck
- [ ] Call `deck.render()` with context
- [ ] Replace direct fetch with BfClient.fetch
- [ ] Add deck metadata to calls

### 2. Configure Environment

- [ ] Document FASTPITCH_BF_API_KEY setup
- [ ] Add OPENROUTER_API_KEY handling
- [ ] Create test configuration

### 3. Add Telemetry Points

- [ ] Track deck execution start/end
- [ ] Log token usage
- [ ] Record latency metrics
- [ ] Capture error states

### 4. Testing

- [ ] Verify telemetry sends correctly
- [ ] Test with mock API key
- [ ] Validate metadata attachment
- [ ] Check error handling

## Environment Variables

```bash
# Required for AI calls via OpenRouter
export OPENROUTER_API_KEY=sk-or-...

# Required for telemetry (use test key for local dev)
export FASTPITCH_BF_API_KEY=bf+test-org

# Optional: Override telemetry endpoint for local testing
export FASTPITCH_BF_TELEMETRY_URL=http://localhost:8000/api/telemetry

# Optional: Disable telemetry entirely
export FASTPITCH_BF_TELEMETRY_ENABLED=false
```

## Monitoring & Debugging

### Check Telemetry Status

```bash
# View telemetry logs if running local BoltFoundry instance
tail -f /path/to/boltfoundry/logs/telemetry.log

# Or check if telemetry endpoint is responding
curl -X GET $FASTPITCH_BF_TELEMETRY_URL/status
```

## Success Criteria

- [ ] All AI calls go through BfClient
- [ ] Telemetry data includes deck metadata
- [ ] Local testing works with mock key
- [ ] Error states properly tracked
- [ ] Documentation complete for setup

## Next Phase

Once telemetry is integrated, proceed to
[Phase 5: Testing & Evaluation](./phase-5-testing-evaluation.md)
