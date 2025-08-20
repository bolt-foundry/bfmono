# Phase 2: Dashboard Integration

## Objective

Display the real Fastpitch deck created from telemetry data in the dashboard,
replacing the mock deck using proper Isograph patterns with a redirect-based
routing architecture.

## Prerequisites

- ✅ Phase 1 complete: Telemetry is sent to backend and stored in bfDb
- ✅ Backend creates/updates BfDeck when telemetry is received
- ✅ Dashboard can fetch decks via GraphQL
- ✅ E2E test exists that verifies telemetry creates deck
- ✅ Server-side redirect handling logic in place
- ✅ BfDeck relationships properly named (graders/samples)

## Problem Statement

The dashboard is hardcoded to display mock decks
(`const [decks] = useState(mockDecks)` in `DeckList.tsx`). We need to replace
this with real GraphQL data using Isograph's client field pattern. Additionally,
we need to implement proper routing with redirect chains and update the database
layer to support persistent data.

## Implementation Plan

### Task 1: Database Layer Updates

**Goal**: Enable persistent storage and proper relationship querying

1. **Add Relationship Query Methods**:
   - Create `apps/bfDb/builders/bfDb/relationshipMethods.ts`
   - Implement `queryDecks` method for querying .many() relationships
   - Implement `createDecksItem` method for creating items in .many()
     relationships
   - Handle edge roles properly

2. **Update Database Configuration**:
   - In `apps/bfDb/storage/registerDefaultAdapter.ts`
   - Change default backend from memory to SQLite for persistence

### Task 2: Implement Redirect-Based Routing Architecture

**Goal**: Create a clean routing hierarchy with server-side redirects

1. **Create Redirect Entrypoints**:
   - `EntrypointPg.ts` - Redirects `/pg` to `/pg/grade`
   - `EntrypointGrade.ts` - Redirects `/pg/grade` to `/pg/grade/decks`
   - These return 302 redirect responses instead of components

2. **Create Component Entrypoints**:
   - `EntrypointGradeDecks.ts` - For `/pg/grade/decks` route
   - `EntrypointDeckDetail.tsx` - For `/pg/grade/decks/:deckId` route
   - `EntrypointAnalyze.ts` - For `/pg/analyze` route
   - `EntrypointChat.ts` - For `/pg/chat` route

3. **Update Routes Configuration**:
   - Remove `/pg/eval` route and `EntrypointEval` import
   - Add new route mappings with redirect chain
   - Handle client-side redirects in `BfIsographFragmentReader.tsx`

### Task 3: Implement Isograph Client Field Pattern

**Goal**: Create proper Isograph component architecture for deck display

1. **Create Main Components**:
   - `Grade.tsx` - Queries currentViewer and selects Organization.DecksView
   - `DecksView.tsx` - Field on Organization type with view header
   - `DeckList.tsx` - Updated to fetch real deck data via GraphQL
   - `DecksListItem.tsx` - Field on BfDeck type for individual items
   - `BfDeckDetailView.tsx` - Full deck detail view with samples

2. **Update Existing Components**:
   - Remove `useState(mockDecks)` from DeckList
   - Replace with Isograph query for Organization.decks
   - Transform GraphQL edges/nodes structure

3. **Create Placeholder Components**:
   - `Analyze.tsx` - Empty state for future implementation
   - `Chat.tsx` - Empty state for future implementation

### Task 4: Update Supporting Infrastructure

**Goal**: Ensure telemetry and context work with real data

1. **Update Telemetry Handler**:
   - In `apps/boltfoundry-com/handlers/telemetry.ts`
   - Update deck creation to include proper edge roles
   - Ensure organization-deck linking uses correct edge metadata

2. **Update EvalContext**:
   - Remove mock data dependencies
   - Add proper data transformation from GraphQL format
   - Handle real deck data structure

### Task 5: Testing and Verification

**Goal**: Ensure everything works end-to-end

1. **Compile Isograph Queries**:
   - Run `bft iso` to compile all new queries
   - Verify generated files in `__generated__/__isograph/`

2. **Update E2E Test**:
   - Create/update `fastpitch-telemetry.test.e2e.ts`
   - Test complete flow from telemetry to UI display
   - Verify redirect chain works properly

## Technical Architecture

### Redirect-Based Routing with Separate Entrypoints

```typescript
// ROUTING ARCHITECTURE: Redirect chain and separate entrypoints
// routes.ts
["/pg", EntrypointPg],                        // Redirects to /pg/grade
["/pg/grade/*", EntrypointGrade],             // Redirects to /pg/grade/decks
["/pg/grade/decks", EntrypointGradeDecks],    // Shows deck list
["/pg/grade/decks/:deckId", EntrypointDeckDetail], // Shows deck detail
["/pg/analyze", EntrypointAnalyze],           // Analyze view
["/pg/chat", EntrypointChat],                 // Chat view

// EntrypointPg.ts - Redirect entrypoint
export const EntrypointPg = iso(`
  field Query.EntrypointPg {
    __typename
  }
`)(function EntrypointPg() {
  return {
    Body: null,
    title: "Redirecting...",
    status: 302,
    headers: {
      Location: "/pg/grade",
    },
  };
});

// EntrypointGrade.ts - Another redirect entrypoint
export const EntrypointGrade = iso(`
  field Query.EntrypointGrade {
    __typename
  }
`)(function EntrypointGrade() {
  return {
    Body: null,
    title: "Redirecting...",
    status: 302,
    headers: {
      Location: "/pg/grade/decks",
    },
  };
});

// EntrypointGradeDecks.ts - Component entrypoint
export const EntrypointGradeDecks = iso(`
  field Query.EntrypointGradeDecks {
    Grade
  }
`)(function EntrypointGradeDecks({ data }) {
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

## Implementation Status

### ✅ Completed

- Server-side redirect handling logic in `server.tsx`
- BfDeck relationships properly named (graders/samples)
- Routes structure defined in `routes.ts`
- E2E test for telemetry generation

### ❌ Not Started

1. **Database Layer**:
   - Relationship query methods (queryDecks, createDecksItem)
   - SQLite backend configuration

2. **Redirect Entrypoints**:
   - `EntrypointPg.ts`
   - `EntrypointGrade.ts`

3. **Component Entrypoints**:
   - `EntrypointGradeDecks.ts`
   - `EntrypointDeckDetail.tsx`
   - `EntrypointAnalyze.ts`
   - `EntrypointChat.ts`

4. **Isograph Components**:
   - `Grade.tsx`
   - `DecksView.tsx`
   - `DecksListItem.tsx`
   - `BfDeckDetailView.tsx`

5. **Component Updates**:
   - DeckList still using `useState(mockDecks)`
   - EvalContext needs mock data removal

6. **Infrastructure**:
   - Telemetry handler edge role updates
   - Client-side redirect handling in `BfIsographFragmentReader.tsx`

## Success Criteria

- ✅ E2E test runs telemetry generation successfully
- ✅ Telemetry creates deck in backend (verified by logs)
- ❌ Fastpitch deck appears in dashboard after telemetry is sent
- ❌ Deck contains real samples with Fastpitch story data
- ❌ Redirect chain works properly (/pg → /pg/grade → /pg/grade/decks)
- ❌ Data persists between server restarts (SQLite backend)

## Current Blockers

1. **Primary Blocker**: DeckList.tsx line 21:
   `const [decks] = useState(mockDecks);`
2. **Database**: Still using memory backend instead of SQLite
3. **Routing**: Missing redirect entrypoints for proper navigation flow
4. **Components**: Missing Isograph components to fetch real data

## Next Steps (Priority Order)

1. **Enable Data Persistence**:
   - Create relationship query methods
   - Switch to SQLite backend

2. **Create Routing Infrastructure**:
   - Build redirect entrypoints (EntrypointPg, EntrypointGrade)
   - Build component entrypoints (EntrypointGradeDecks, etc.)
   - Update routes.ts to use new entrypoints

3. **Implement Isograph Components**:
   - Create Grade, DecksView, DecksListItem components
   - Update DeckList to fetch real data
   - Remove mock data dependencies

4. **Compile and Test**:
   - Run `bft iso` to compile queries
   - Test full flow with `bft dev` and `bft fastpitch`
   - Verify E2E test passes

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
