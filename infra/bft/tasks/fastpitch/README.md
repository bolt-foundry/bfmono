# Fastpitch - AI/Tech News Curator for Engineers

Fastpitch curates the top 5 most relevant AI and technology stories for software
engineers, helping teams stay informed about critical industry changes that
impact their work.

## Purpose

In the fast-paced world of technology, engineers need to stay current with
breaking changes, new tools, and industry shifts. Fastpitch analyzes a
collection of technology articles and selects the most impactful stories based
on **engineering effectiveness** - would knowing about this story help an
engineer do their job better?

## Installation

Fastpitch is built into the BFT (Bolt Foundry Tasks) framework and requires:

1. **Deno 2.x** runtime
2. **OpenRouter API key** for AI-powered curation
3. **Bolt Foundry API key** for telemetry (optional)

## Configuration

Set the following environment variables:

```bash
# Required for AI curation
export OPENROUTER_API_KEY=sk-or-...

# Optional: Bolt Foundry telemetry
export FASTPITCH_BF_API_KEY=bf+your-key

# Optional: Override OpenRouter endpoint
export OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Optional: Override telemetry endpoint
export FASTPITCH_BF_TELEMETRY_URL=http://localhost:8000/api/telemetry
```

## Usage

### Basic Usage

Process a CSV file of articles and get the top 5 stories:

```bash
bft fastpitch generate --input articles.csv
```

### Save Output to File

```bash
bft fastpitch generate --input articles.csv --output top-stories.json
```

### Test with Sample Data

```bash
# Use existing test data
bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv

# Or create a small test set
head -10 shared/fastpitch-data/raw/articles_0.csv > test.csv
bft fastpitch generate --input test.csv
```

## Input Format

### CSV Format

The CSV file should have the following columns:

- `id` - Unique identifier
- `title` - Article headline
- `content` - Full article text
- `url` - Link to the article
- `published_at` - Publication date
- `scraped_at` - When the article was collected
- `source_id` - Source identifier
- `relevance_score` - Pre-computed relevance score (optional)

Example:

```csv
id,title,content,url,published_at,scraped_at,source_id,relevance_score
1,Node.js 22 Released,"Node.js 22 introduces native TypeScript support...",https://...,2025-01-01,2025-01-01,1,90
```

### JSON Format (Alternative)

You can also provide articles as JSON:

```json
[
  {
    "title": "Node.js 22 Released",
    "content": "Node.js 22 introduces native TypeScript support...",
    "url": "https://nodejs.org/blog/release-v22",
    "published_at": "2025-01-01"
  }
]
```

## Output Format

Fastpitch returns JSON with the top 5 stories, including summaries and
reasoning:

```json
{
  "selected_stories": [
    {
      "title": "Node.js 22 Released with Native TypeScript Support",
      "summary": "Node.js 22 introduces native TypeScript support and 30% performance improvements, eliminating the need for separate transpilation.",
      "url": "https://nodejs.org/blog/release-v22",
      "reasoning": "Major release affecting all Node.js developers with breaking changes and new capabilities that change development workflows"
    }
  ]
}
```

## How It Works

1. **Load Articles**: Reads technology articles from CSV or JSON
2. **AI Analysis**: Uses the `fastpitch-curator` deck to analyze stories
3. **Ranking**: Evaluates stories based on engineering impact
4. **Summarization**: Creates one-sentence summaries in inverted pyramid style
5. **Selection**: Returns top 5 most relevant stories with reasoning

## Selection Criteria

Fastpitch prioritizes stories that help engineers:

- Make better technical decisions
- Stay current with critical industry changes
- Understand new tools or platforms
- Be aware of security issues or breaking changes
- Learn about major shifts in the technology landscape

## Testing

### Smoke Test

```bash
# Validate the deck
bft deck validate infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md

# Run with test data
bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv
```

### Mock Mode

If `OPENROUTER_API_KEY` is not set, Fastpitch runs in mock mode with sample
responses:

```bash
unset OPENROUTER_API_KEY
bft fastpitch generate --input test.csv
```

## Telemetry

When configured with `FASTPITCH_BF_API_KEY`, Fastpitch automatically tracks:

- AI model usage and performance
- Token consumption
- Curation patterns
- Error rates

This data helps improve the curation algorithm over time through RLHF workflows.

## Troubleshooting

### "OPENROUTER_API_KEY not set" Warning

Set your OpenRouter API key:

```bash
export OPENROUTER_API_KEY=sk-or-your-key-here
```

### CSV Parsing Errors

Ensure your CSV has proper formatting. For complex content with newlines,
consider using JSON format instead.

### Empty or Invalid Responses

Check that your articles have sufficient content. The AI needs enough context to
make curation decisions.

## Future Enhancements

- Automated daily/weekly digests
- Discord integration for team notifications
- Custom ranking criteria per team
- Source quality scoring
- Duplicate detection and merging

## Support

For issues or questions, create a ticket in the internal issue tracker or reach
out to the Bolt Foundry team.
