# Phase 1: Data Preparation

## Objective

Verify and prepare existing test data for AI-focused story curation.

## Current Status

✅ **Data already exists** in `/internalbf/bfmono/shared/fastpitch-data/raw/`

- `articles_0.csv` - AI/tech stories with columns: id, title, content, url,
  published_at, scraped_at, source_id, relevance_score
- `articles_1.csv` - Additional articles
- `articles_2.csv` - More articles

## Tasks

### 1. Verify Existing Data

- [ ] Check that CSV files exist in `shared/fastpitch-data/raw/`
- [ ] Confirm columns match expected format
- [ ] Verify stories are AI/tech focused (not sports)

### 2. Organize Data Structure

```
shared/fastpitch-data/
├── raw/              # Original CSV files from Google Drive
├── processed/        # Cleaned and formatted data
└── samples/          # Small test sets for development
```

### 3. Create Test Dataset

- [ ] Use `articles_0.csv` for initial testing (already contains AI/tech
      stories)
- [ ] Optional: Create smaller test file with
      `head -20 articles_0.csv > test.csv`
- [ ] Stories already include titles like:
  - "Rubrik acquires Predibase to accelerate adoption of AI agents"
  - "Anthropic just made every Claude user a no-code app developer"

## Success Criteria

- [x] Test data accessible in `shared/fastpitch-data/raw/`
- [x] AI/tech-focused stories available (100+ in each CSV)
- [x] CSV format with required columns (title, content, url, etc.)
- [ ] Ready for deck consumption via CSV parsing

## Next Phase

Once data is prepared, proceed to
[Phase 2: Deck Development](./phase-2-deck-development.md)
