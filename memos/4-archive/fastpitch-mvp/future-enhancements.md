# Future Enhancements - Fastpitch

## Additional BFT Commands

### `bft fastpitch crawl`

**Purpose:** Collect stories from external data sources

- Parse RSS feeds from tech news sites
- Integrate with APIs (Hacker News, Reddit, etc.)
- Store in standardized JSON format
- Support filtering by date/topic

### `bft fastpitch run`

**Purpose:** Execute complete pipeline end-to-end

- Combine crawl + generate in single command
- Support scheduled execution
- Handle incremental updates
- Cache previously processed stories

### `bft fastpitch evaluate`

**Purpose:** Measure quality of outputs

- Compare generated summaries against ground truth
- Calculate accuracy metrics
- Generate quality reports
- Support A/B testing different deck versions

## Discord Integration

Move from manual execution to automated daily delivery:

- Implement scheduled job system
- Create Discord bot/webhook integration
- Format output for Discord markdown
- Add channel configuration
- Support multiple channels/teams

## Data Source Expansion

### Google Drive Integration

- Automated sync with shared folders
- Watch for new CSV uploads
- Version tracking

### API Integrations

- Hacker News API
- Reddit API (r/programming, r/machinelearning)
- Dev.to API
- TechCrunch RSS
- ArXiv recent papers

## Advanced Features

### Personalization

- Team-specific story preferences
- Role-based filtering (frontend, backend, ML, etc.)
- Custom ranking weights

### Analytics

- Track which stories get clicked
- Measure engagement metrics
- Feedback loop to improve ranking

### Multi-format Delivery

- Email digest option
- Slack integration
- Web dashboard
- RSS feed output
