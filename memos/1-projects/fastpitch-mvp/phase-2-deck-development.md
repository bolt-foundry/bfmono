# Phase 2: Deck Development

## Objective

Create a single AI-focused deck using the Hourglass Principle that handles story
ranking, summarization, and selection.

## Single Deck Approach

### Fastpitch Curator Deck (`fastpitch-curator.deck.md`)

**Purpose:** Process a list of stories to rank, summarize, and select the top 5
most relevant for engineers

**Input:** The deck will receive stories as context - BfClient/render system
handles variable injection automatically

**Core Functions:**

1. Evaluate each story by engineering impact
2. Generate one-sentence summary for each story
3. Select and order top 5 stories by relevance
4. Return formatted results

**Ranking Criteria:**

- Would this affect an engineer's ability to do their job?
- Is this a breaking change or deprecation?
- Does this introduce new tools or capabilities?
- Are there security implications?

**Summary Requirements:**

- Single sentence maximum
- Inverted pyramid style (most important first)
- Focus on practical impact
- Clear and scannable

**Output Format:**

```json
{
  "selected_stories": [
    {
      "title": "Breaking: Node.js 22 Released",
      "summary": "Node.js 22 introduces native TypeScript support and 30% performance improvements.",
      "url": "https://...",
      "reasoning": "Major release affecting all Node.js developers with breaking changes and new capabilities"
    }
  ]
}
```

## Implementation Steps

### 1. Create Deck Directory

```bash
mkdir -p /internalbf/bfmono/infra/bft/tasks/fastpitch/decks
```

### 2. Implement Fastpitch Curator Deck

- [ ] Create `fastpitch-curator.deck.md`
- [ ] Define system prompt following Hourglass Principle

### 3. Create Context Definition

- [ ] Create `contexts.toml` to define context variables
- [ ] Call `deck.render()` in BFT task to process the deck

## Testing Approach

### Deck Validation

```bash
# Validate deck syntax and file references
bft deck validate /infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md
```

### Integration Testing

The actual deck execution will be tested through the fastpitch BFT task:

- [ ] Test with full list of stories from CSV via `bft fastpitch`
- [ ] Verify ranking consistency across runs
- [ ] Check summary quality and format
- [ ] Validate top 5 selection logic

## Success Criteria

- [ ] Single deck created and validated
- [ ] Returns ordered top 5 with summaries
- [ ] Output format matches specification
- [ ] Context variables defined in contexts.toml
- [ ] BFT task calls deck.render() successfully

## References

- [Context Engineering Approach](./context-engineering-approach.md)
- [Hourglass Principle Article](https://contexteng.ai/p/context-engineering-101-the-hourglass)

## Next Phase

Once decks are working, proceed to
[Phase 3: BFT Implementation](./phase-3-bft-implementation.md)
