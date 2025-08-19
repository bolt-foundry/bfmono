# Phase 2: Dashboard Integration

## Objective

Display the real Fastpitch deck created from telemetry data in the dashboard,
replacing the mock deck using proper Isograph patterns.

## Prerequisites

- ✅ Phase 1 complete: Telemetry is sent to backend and stored in bfDb
- ✅ Backend creates/updates BfDeck when telemetry is received
- ✅ Dashboard can fetch decks via GraphQL
- ✅ E2E test exists that verifies telemetry creates deck

## Problem Statement

The dashboard is hardcoded to display mock decks
(`const [decks] = useState(mockDecks)` in `DeckList.tsx`). We need to replace
this with real GraphQL data using Isograph's client field pattern.

## Implementation Plan

### Task 1: Implement Isograph Client Field Pattern

**Goal**: Create proper Isograph component architecture for deck display

1. **Create DeckList as Organization Client Field**:
   - Define `DeckList` as an Isograph component on `Organization` type
   - Component fetches its own deck data via GraphQL
   - Follows "resolvers all the way down" pattern

2. **Update Parent Components**:
   - Modify `Eval.tsx` to select `Organization.DeckList` field
   - Remove direct deck fetching from parent
   - Let DeckList handle its own data requirements

3. **Transform GraphQL Data**:
   - Convert GraphQL edges/nodes structure to component format
   - Handle loading and empty states properly
   - Maintain existing UI behavior

### Task 2: Update E2E Test Verification

**Goal**: Ensure test properly validates real deck display

1. **Current Test Status**:
   - ✅ Login and org creation working
   - ✅ Telemetry successfully creates deck (200 status)
   - ❌ UI still shows mock decks

2. **Test Improvements Needed**:
   - Wait for GraphQL data to load
   - Verify Fastpitch deck appears (by name/slug)

## Technical Architecture

### Isograph Component Pattern with Separate Entrypoints

```typescript
// ROUTING ARCHITECTURE: Separate entrypoints for each major view
// routes.ts
["/pg/grade/*", entrypointGrade],    // Grade entrypoint
["/pg/analyze", entrypointAnalyze],  // Analyze entrypoint  
["/pg/chat", entrypointChat],        // Chat entrypoint

// EntrypointGrade.ts - Entrypoint for grading views
export const EntrypointGrade = iso(`
  field Query.EntrypointGrade {
    Grade
  }
`)(function EntrypointGrade({ data }) {
  const Body = data.Grade;
  return { Body, title: "Grade - Bolt Foundry" };
});

// Grade.tsx - Main component that selects DecksView
export const Grade = iso(`
  field Query.Grade @component {
    currentViewer {
      asCurrentViewerLoggedIn {
        organization {
          DecksView
        }
      }
    }
  }
`)(function Grade({ data }) {
  const DecksView = data?.currentViewer?.asCurrentViewerLoggedIn?.organization?.DecksView;
  return <DecksView />;
});

// DecksView.tsx - Main decks view as a field on Organization
export const DecksView = iso(`
  field Organization.DecksView @component {
    DeckList
  }
`)(function DecksView({ data }) {
  const DeckList = data.DeckList;
  
  return (
    <div className="decks-view">
      <div className="view-header">
        <h2>Decks</h2>
        <p className="view-description">
          Create and manage evaluation frameworks for grading AI responses
        </p>
      </div>
      <DeckList />
    </div>
  );
});

// DeckList.tsx - List of decks as a field on Organization
export const DeckList = iso(`
  field Organization.DeckList @component {
    decks(first: 100) {
      edges {
        node {
          DecksListItem
        }
      }
    }
  }
`)(function DeckList({ data }) {
  const deckItems = data.decks?.edges?.map((edge) => edge.node.DecksListItem) || [];

  if (deckItems.length === 0) {
    return (
      <BfDsEmptyState
        icon="deck"
        title="No decks yet"
        description="Run fastpitch generate to create evaluation decks"
      />
    );
  }

  return (
    <div className="decks-list">
      {deckItems.map((DecksListItem, index) => <DecksListItem key={index} />)}
    </div>
  );
});

// DecksListItem.tsx - Individual deck item as a field on BfDeck
export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
    description
    slug
  }
`)(function DecksListItem({ data }) {
  const { navigate } = useRouter();

  const handleClick = () => {
    navigate(`/pg/grade/decks/${data.id}`);
  };

  return (
    <div className="deck-item" onClick={handleClick}>
      <h4>{data.name}</h4>
      <p>{data.description}</p>
    </div>
  );
});
```

## E2E Test Status

The existing test in `fastpitch-telemetry.test.e2e.ts` covers:

- ✅ Login flow with org creation
- ✅ Fastpitch telemetry generation with BfClient
- ✅ Telemetry successfully creates deck (200 response)
- ❌ Dashboard still shows mock decks (hardcoded in DeckList.tsx:21)

## Implementation Steps

1. **Create Separate Entrypoints** (✅ Done):
   - `EntrypointGrade.ts` - For /pg/grade/* routes
   - `EntrypointAnalyze.ts` - For /pg/analyze route
   - `EntrypointChat.ts` - For /pg/chat route
   - Each entrypoint loads only its required components

2. **Create Top-Level Components** (✅ Done):
   - `Grade.tsx` - Selects Organization.DecksView
   - `Analyze.tsx` - Placeholder with BfDsEmptyState
   - `Chat.tsx` - Placeholder with BfDsEmptyState

3. **Create Isograph Deck Components** (Pending):
   - `DecksView.tsx` - Field on Organization type (main view)
   - `DeckList.tsx` - Field on Organization type (list container)
   - `DecksListItem.tsx` - Field on BfDeck type (individual item)

4. **Update Routes** (Pending):
   - Update routes.ts to use new entrypoints
   - Remove EntrypointEval references

5. **Run Isograph Compiler**:
   - Execute `bft iso` to generate GraphQL queries
   - Update type definitions

6. **Test with E2E**:
   - Verify Fastpitch deck appears
   - Check navigation works

## Success Criteria

- ✅ E2E test runs telemetry generation successfully
- ❌ Fastpitch deck appears in dashboard after telemetry is sent
- ❌ Deck contains real samples with Fastpitch story data
- ✅ Telemetry creates deck in backend (verified by logs)

## Current Blockers

- DeckList.tsx line 21: `const [decks] = useState(mockDecks);`
- Need to implement proper Isograph client field pattern

## Implementation Decisions

- **Separate Entrypoints**: Each major route has its own entrypoint for better
  code splitting
- **Component Hierarchy**: DecksView → DeckList → DecksListItem (all Isograph
  components)
- **No Props**: Components don't pass data to each other, each fetches its own
- **Remove Features**: Delete search/filtering and deck creation for now
- **Direct Navigation**: DecksListItem handles its own click navigation
- **Data Fetching**: Just fetch deck info for now (no samples)
- **Compiler**: Use `bft iso` to compile Isograph queries
- **Import Path**: Components available through `@iso-bfc` after compilation

## Architecture Benefits

- **Performance**: Each route only loads the data it needs
- **Independence**: Components are truly self-contained
- **Maintainability**: No complex routing logic inside components
- **Isograph-idiomatic**: Follows "resolvers all the way down" philosophy

## Next Phase

Once real decks are displaying properly, proceed to
[Phase 3: Feedback Loop Foundation](./phase-3-feedback-loop.md)
