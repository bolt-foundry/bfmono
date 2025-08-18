# Fastpitch MVP

Implementation of Fastpitch sports news summarizer as internal MVP and proof of
concept for Bolt Foundry.

## Project Documentation

- [Open Questions](./open-questions.md) - Questions to resolve during
  implementation
- [Answered Questions](./answered-questions.md) - Decisions made with
  research-backed rationale
- [Context Engineering Approach](./context-engineering-approach.md) - Hourglass
  principle for deck design

### Launch Plan References

- [Launch Overview](../../../../internal-memos/1-projects/0.0-launch/README.md)
- [Phase 1: Internal MVP](../../../../internal-memos/1-projects/0.0-launch/phase-1-internal-mvp.md)
- [Phase 2: Bolt Foundry Integration](../../../../internal-memos/1-projects/0.0-launch/phase-2.md)

## Current Status

🔴 **Phase 1: Internal MVP** - In Progress

**Next Step:** Start building Fastpitch prototypes for story selection

## 🎯 Key Discovery: Fastpitch Foundation Exists!

The codebase already contains Fastpitch components in
`apps/aibff/decks/fastpitch/`:

- **Legacy sports curator deck** - Existing implementation to be replaced
- **Sports relevance graders** - Evaluation decks we can adapt
- **Test data** - CSV files with sports stories from multiple dates
- **Sample configurations** - JSONL and TOML files with ground truth

## Implementation Plan (Updated)

### Core Components (Required for Launch)

#### 1. Story Selection System 🔴 New AI-Focused Implementation

- **Replace:** Create new AI-focused deck to replace sports-specific
  implementation
- **TODO:** Pull fresh AI-focused test data from Google Drive to shared folder
- **TODO:** Design deck using
  [Context Engineering Approach](./context-engineering-approach.md)
- **TODO:** Implement ranking by engineering effectiveness ("would this affect
  an engineer's ability to do their job?")
- **TODO:** Generate one-sentence summaries using inverted pyramid style

#### 2. BfClient & Telemetry ✅ Ready to Use

- **Existing:** `packages/bolt-foundry/BfClient.ts` - Wraps fetch() for
  telemetry
- **Existing:** Auto-sends to `boltfoundry.com/api/telemetry`
- **Existing:** Server handler creates BfDeck and BfSample records
- **TODO:** Ensure all Fastpitch AI calls use BfClient

#### 3. CLI Structure 🔴 New BFT Tasks

- **Create new:** Single `fastpitch.bft.ts` file with sub-commands
- **Reference:** `infra/bft/tasks/deck.bft.ts` - Pattern for multi-command tasks
- **MVP Command:**
  - `bft fastpitch` - Show help
  - `bft fastpitch generate` - Process stories through deck, return top 5
- **Output format:** JSON only
- **Future:** Additional commands in
  [future-enhancements.md](./future-enhancements.md)

### Architecture Approach (Revised)

- **Create BFT task:** `infra/bft/tasks/fastpitch.bft.ts` with sub-commands
- **Create decks:** Place in `infra/bft/tasks/fastpitch/decks/` near the task
- **Use existing data:** CSV files in `shared/fastpitch-data/raw/`
  (articles_0.csv, etc.)
- **Use telemetry:** Ensure all AI calls go through BfClient

### Implementation Phases

1. **[Phase 1: Data Preparation](./phase-1-data-preparation.md)** - Pull and
   organize test data
2. **[Phase 2: Deck Development](./phase-2-deck-development.md)** - Create
   AI-focused decks
3. **[Phase 3: BFT Implementation](./phase-3-bft-implementation.md)** - Build
   CLI commands
4. **[Phase 4: Telemetry Integration](./phase-4-telemetry-integration.md)** -
   Wire up tracking
5. **[Phase 5: Testing & Evaluation](./phase-5-testing-evaluation.md)** -
   Validate results

### Related Files

#### Core Implementation Files

- `infra/bft/tasks/fastpitch.bft.ts` - Main BFT task file
- `infra/bft/tasks/fastpitch/decks/` - Location for new AI-focused decks
- `shared/fastpitch-data/raw/articles_*.csv` - Existing AI/tech story data
- `packages/bolt-foundry/deck.ts` - Deck rendering system
- `packages/bolt-foundry/BfClient.ts` - Telemetry client

#### Reference Implementation Files

- `infra/bft/bft.ts` - BFT task runner core
- `infra/bft/tasks/*.bft.ts` - Example task implementations
- `apps/bfDb/nodeTypes/GithubRepoStats.ts` - External API pattern
- `apps/boltfoundry-com/handlers/telemetry.ts` - Telemetry server

## Stretch Goals (Post-Launch)

### Discord Integration 🔴 Future Enhancement

- **Reference:** `apps/internalbf/internalbf.ts` - ThanksBot implementation
- **Reference:** `apps/contacts/server/services/discord.ts` - Webhook pattern
- **TODO:** Implement scheduled job (no existing scheduler pattern)
- **TODO:** Create Discord message formatter for sports stories
- **TODO:** Add Discord webhook/bot configuration

This would enable daily automated delivery to the team Discord channel for
dogfooding.

## Test Data

Test data available at:
https://drive.google.com/drive/folders/1fA5WxIrz9VIySx6OK2wHO1zvGCpSpMvk

**Approach:** Manual download to `shared/fastpitch-data/` (no Google Drive API
integration needed)
