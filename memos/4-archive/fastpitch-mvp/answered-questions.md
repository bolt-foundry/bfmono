# Answered Questions - Fastpitch MVP

## CLI Implementation

**Question:** Should we integrate with aibff or create new CLI? **Answer:**
Create BFT tasks with `fastpitch` namespace in `infra/bft/tasks/` **Rationale:**
Simpler integration, follows existing patterns, avoids coupling with aibff

## Discord Integration

**Question:** Is Discord integration required for launch? **Answer:** No, it's a
stretch goal for post-launch **Rationale:** Not essential for MVP, can be added
later for dogfooding

## Context Engineering

**Question:** How should we structure the AI prompts? **Answer:** Follow the
Hourglass Principle - see
[context-engineering-approach.md](./context-engineering-approach.md)
**Rationale:** More effective AI interactions, better results with less prompt
engineering

## Existing Code

**Question:** Should we use the existing sports-curator deck? **Answer:** No,
create new AI-focused implementation **Rationale:** Current implementation not
aligned with new AI-first approach

## Telemetry

**Question:** Do we need to implement telemetry from scratch? **Answer:** No,
use existing BfClient from `packages/bolt-foundry/` **Rationale:** Already
implemented, auto-sends to boltfoundry.com

## Data Source

**Question:** Should we use existing CSV test data or build Google Drive
integration? **Answer:** Pull fresh test data from Google Drive manually and
store locally in shared folder **Rationale:**

- No Google Drive API integration needed - just manual download
- Existing CSV data in apps/aibff is sports-specific, not AI-focused
- Store fresh AI-focused data in shared folder for team access
- Simpler approach without API complexity

## BFT Task Structure

**Question:** How should we structure the BFT tasks? **Answer:** Single
`fastpitch.bft.ts` file with sub-commands **Rationale:**

- Follows established patterns (deck.bft.ts, dev.bft.ts)
- Clean namespace: `bft fastpitch <command>`
- Better discoverability of related functionality
- Easier to maintain than multiple files

**Commands to implement:**

- `bft fastpitch` - Show help
- `bft fastpitch crawl` - Collect sports stories
- `bft fastpitch generate` - Generate summaries
- `bft fastpitch run` - Run complete pipeline
- `bft fastpitch evaluate` - Evaluate results

## Deck Location

**Question:** Where should the new AI-focused deck live? **Answer:** Create in
`/infra/bft/tasks/fastpitch/decks/` directory **Rationale:**

- Co-located with BFT task for better organization
- Keeps all Fastpitch components together
- Follows principle of keeping related files near each other

## Output Format

**Question:** What format should the output take? **Answer:** Support multiple
formats with console as default **Rationale:**

- Console for human readability (default)
- JSON for automation and integration
- CSV for spreadsheet analysis
- Use `ui.output()` for piping support
- Save to `shared/fastpitch-summaries/` for team access

**Format flags:**

- `--format=console|json|csv|markdown`
- `--output=filename` for file saving
- Date-based filenames for organization

## Telemetry Testing

**Question:** How do we verify telemetry without boltfoundry.com access?
**Answer:** Use existing BfClient test infrastructure **Rationale:**

- Comprehensive mock fetch patterns already exist
- Unit tests provide full coverage
- Integration tests verify database operations
- No need for separate mock server
- Set `BF_API_KEY=bf+test-org` for local testing

## Summary Generation

**Question:** What level of detail for summaries? **Answer:** One sentence with
key information, using inverted pyramid style **Rationale:**

- News style inverted pyramid puts most important info first
- Single sentence forces focus on what matters
- Easier to scan multiple summaries quickly
- Follows journalistic best practices

## Story Ranking

**Question:** What criteria for "top 5" selection? **Answer:** Rank by impact on
an engineer's ability to do their job effectively **Rationale:**

- Focus on engineering productivity and effectiveness
- Prioritize breaking changes, new tools, security issues
- Deprioritize general news that doesn't affect daily work
- Aligns with internal MVP goal of helping engineers stay informed

## Pipeline Execution

**Question:** How should the daily pipeline work? **Answer:** Manual execution
only for now **Rationale:**

- Simpler implementation for MVP
- No scheduler complexity needed
- Can run on-demand with `bft fastpitch run`
- Automation can be added post-launch if needed
