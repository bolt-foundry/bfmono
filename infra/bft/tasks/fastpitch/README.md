# Fastpitch

AI-powered news curator that selects the top 5 most impactful technology stories
for engineering teams.

## Purpose

Fastpitch analyzes a collection of technology articles and uses AI to identify
the stories that would most significantly impact a software engineer's ability
to do their job effectively. It prioritizes engineering effectiveness over
general business news.

## Usage

### Basic Command

```bash
bft fastpitch generate --input <csv-file> [--output <output-file>]
```

### Examples

```bash
# Process articles and display results
bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv

# Save results to a file
bft fastpitch generate --input articles.csv --output top-stories.json
```

## Input Format

The input CSV file must contain the following columns:

- `id` - Unique article identifier
- `title` - Article headline
- `content` - Article text/summary
- `url` - Link to full article
- `published_at` - Publication timestamp
- `scraped_at` - When article was collected
- `source_id` - Source identifier
- `relevance_score` - Initial relevance score

Example CSV:

```csv
id,title,content,url,published_at,scraped_at,source_id,relevance_score
1,OpenAI Releases GPT-5,New model shows significant improvements...,https://example.com,2025-06-25 17:00:00,2025-06-25 17:00:00,1,90
```

## Output Format

The command outputs JSON with the top 5 selected stories:

```json
{
  "stories": [
    {
      "title": "Story headline",
      "summary": "One-sentence summary focusing on the key engineering impact.",
      "url": "https://...",
      "reasoning": "Explanation of why this matters to engineers"
    }
  ]
}
```

## Configuration

### Required Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key for AI processing
- `BF_API_KEY` - Bolt Foundry API key for telemetry (format: `bf+your-key`)

### Optional Environment Variables

- `FASTPITCH_BF_API_KEY` - Override default BF API key
- `FASTPITCH_BF_TELEMETRY_URL` - Custom telemetry endpoint

## Testing

### Quick Test

```bash
# Create a simple test file
cat > test.csv << 'EOF'
id,title,content,url,published_at,scraped_at,source_id,relevance_score
1,Test Story,Test content,https://example.com,2025-06-25 17:00:00,2025-06-25 17:00:00,1,80
EOF

# Run with test data
export OPENROUTER_API_KEY=your-key
export BF_API_KEY=bf+your-key
bft fastpitch generate --input test.csv
```

### Validate Deck

```bash
bft deck validate infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md
```

## How It Works

1. **Input Processing**: Reads CSV file containing technology articles
2. **Deck Rendering**: Uses the `fastpitch-curator.deck.md` to create an AI
   prompt
3. **AI Curation**: Sends articles to AI model via OpenRouter for analysis
4. **Selection**: AI selects top 5 stories based on engineering impact
5. **Output**: Returns JSON with selected stories, summaries, and reasoning
6. **Telemetry**: Tracks usage via Bolt Foundry telemetry (when configured)

The curation process prioritizes:

- Major platform/framework releases with breaking changes
- New AI capabilities that change development workflows
- Critical security vulnerabilities
- Significant acquisitions affecting developer tools
- Open source ecosystem changes
- New developer tools solving common problems

## Troubleshooting

### CSV Parse Errors

If you encounter CSV parsing errors, ensure:

- No multiline content in fields (or properly escaped)
- All rows have the correct number of columns
- No special characters breaking the CSV format

### API Errors

- Verify your `OPENROUTER_API_KEY` is valid
- Check your OpenRouter account has sufficient credits
- Ensure `BF_API_KEY` follows the format `bf+your-key`
