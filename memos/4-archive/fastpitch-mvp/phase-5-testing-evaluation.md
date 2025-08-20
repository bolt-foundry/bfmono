# Phase 5: Testing & Evaluation

## Objective

Validate that the Fastpitch MVP runs successfully and integrates properly.

## Testing Approach

### 1. Deck Validation

```bash
# Validate the single deck file
bft deck validate infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md
```

### 2. Smoke Test

```bash
# Use existing test data
bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv

# Or test with just a few rows
head -10 shared/fastpitch-data/raw/articles_0.csv > test-articles.csv
bft fastpitch generate --input test-articles.csv

# Verify it completes without errors and outputs JSON
```

### 3. Telemetry Verification

```bash
# Set up test environment
export FASTPITCH_BF_API_KEY=bf+test-org
export FASTPITCH_BF_TELEMETRY_URL=http://localhost:8000/api/telemetry

# Run generate command
bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv

# Check that telemetry was sent (if local BoltFoundry is running)
```

## Success Criteria

- [ ] Deck validates successfully
- [ ] Generate command runs without errors
- [ ] Outputs valid JSON
- [ ] Telemetry is tracked (when configured)

## Manual Review

After the smoke test passes, manually review:

- [ ] Output contains 5 or fewer stories
- [ ] Each story has title, summary, url, and reasoning
- [ ] Summaries are single sentences
- [ ] Reasoning explains engineering relevance

## Documentation

### Create Fastpitch README

Create `infra/bft/tasks/fastpitch/README.md` to document:

- [ ] **Purpose**: Explain that Fastpitch curates top 5 AI/tech stories for
      engineers
- [ ] **Usage examples**: Show basic command usage with CSV input
- [ ] **Input format**: Document expected CSV columns (title, content, url,
      etc.)
- [ ] **Output format**: Describe JSON structure with selected stories
- [ ] **Configuration**: List required environment variables
      (OPENROUTER_API_KEY, FASTPITCH_BF_*)
- [ ] **Testing instructions**: How to run with sample data
- [ ] **How it works**: Brief explanation of the deck-based curation process

## Next Steps

Once testing passes:

1. Document any issues found
2. Create sample data for demo
3. Prepare for internal launch

```
```
