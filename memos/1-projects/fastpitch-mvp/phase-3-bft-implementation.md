# Phase 3: BFT Implementation

## Objective

Create BFT tasks for the Fastpitch pipeline with manual execution control.

## File Structure

```
infra/bft/tasks/
└── fastpitch.bft.ts         # Main task file with all sub-commands
    └── fastpitch/
        └── decks/            # Deck files from Phase 2
```

## Commands to Implement

### 1. `bft fastpitch` (Help Command)

Shows available sub-commands and usage

### 2. `bft fastpitch generate`

**Purpose:** Process stories through the fastpitch-curator deck to get top 5
with summaries

**Arguments:**

- `--input <file>` - CSV file with stories (from shared/fastpitch-data/raw/)
- `--output <file>` - Save to file instead of stdout

**Process:**

1. Load stories from input CSV file (columns: id, title, content, url,
   published_at, etc.)
2. Parse CSV using `@std/csv` library
3. Call deck.render() with fastpitch-curator deck
4. Pass stories array as context to the deck
5. Receive ordered top 5 with summaries and reasoning
6. Output as JSON

**Output:** JSON with ordered list of top 5 stories including summaries and
reasoning

## Output Format

```json
{
  "date": "2025-01-18",
  "selected_stories": [
    {
      "title": "Breaking: Node.js 22 Released",
      "summary": "Node.js 22 introduces native TypeScript support and 30% performance improvements.",
      "url": "https://...",
      "reasoning": "Major release affecting all Node.js developers with breaking changes"
    }
  ]
}
```

## Testing Plan

### Smoke Test

- [ ] Run
      `bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv`
- [ ] Verify it completes without errors

## Success Criteria

- [ ] Generate command implemented and working
- [ ] Proper error handling and user feedback
- [ ] JSON output format working
- [ ] Integration with deck system via deck.render()
- [ ] BfClient telemetry working

## Next Phase

Once BFT tasks are complete, proceed to
[Phase 4: Telemetry Integration](./phase-4-telemetry-integration.md)
