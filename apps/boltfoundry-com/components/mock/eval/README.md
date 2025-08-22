# Mock Eval Interface

Mock implementation of the evaluation interface using static data.

## Routes

- `/mock/pg/grade/decks` - Deck management
- `/mock/pg/analyze` - Analysis dashboard
- `/mock/pg/chat` - AI chat interface

## Components

- **Layout/**: Header, sidebars, main content routing
- **Decks/**: Deck list, detail views, configuration
- **Grading/**: Sample lists, grading inbox, rating interface
- **Analyze/**: Metrics dashboard, disagreement resolution
- **Chat/**: AI conversation interface

## Mock Data

- `mocks/deckData.ts` - Sample deck configurations
- `mocks/gradingSamples.ts` - Grading sample data
- `mocks/fastpitchSamples.ts` - Test sample set

## Usage Guide

1. **Start at `/mock/pg/grade/decks`** - View available decks
2. **Click a deck** - Opens deck detail with sample list
3. **Grade samples** - Click the callout or "Inbox" tab to start grading
4. **Refine graders** - Select samples, click "Refine" to improve grader
   accuracy
5. **View progress** - Check "Graders" tab to see refinement progress

## Notes

- Uses static data (no persistence)
- Purple styling indicates mock mode
