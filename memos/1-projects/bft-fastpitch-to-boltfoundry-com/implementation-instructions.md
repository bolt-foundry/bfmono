# Implementation Instructions - Phase 2 Dashboard Integration

## Overview

Replace mock deck data with real telemetry-generated decks using pure Isograph
patterns.

## Database Layer Changes

### 1. Add Relationship Query Methods

Create `apps/bfDb/builders/bfDb/relationshipMethods.ts`:

- Implement `queryDecks` method for querying .many() relationships
- Implement `createDecksItem` method for creating items in .many() relationships
- These methods should handle edge roles properly

### 2. Update Database Configuration

In `apps/bfDb/storage/registerDefaultAdapter.ts`:

- Change default backend from memory to SQLite for persistence

### 3. Fix BfDeck Relationships

In `apps/bfDb/nodeTypes/rlhf/BfDeck.ts`:

- Rename relationships: `grader` → `graders`, `sample` → `samples`

## Routing Architecture

### 1. Create Separate Entrypoints

Create new entrypoint files in `apps/boltfoundry-com/entrypoints/`:

#### Redirect Entrypoints

These entrypoints return redirect responses instead of components:

`EntrypointPg.ts` - Redirects `/pg` to `/pg/grade`:

```typescript
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
```

`EntrypointGrade.ts` - Redirects `/pg/grade` to `/pg/grade/decks`:

```typescript
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
```

#### Component Entrypoints

These return actual components:

- `EntrypointGradeDecks.ts` - For `/pg/grade/decks` route (renders Grade
  component)
- `EntrypointDeckDetail.tsx` - For `/pg/grade/decks/:deckId` route
- `EntrypointAnalyze.ts` - For `/pg/analyze` route
- `EntrypointChat.ts` - For `/pg/chat` route

### 2. Update Routes Configuration

In `apps/boltfoundry-com/routes.ts`:

- Remove the `/pg/eval` route that uses `EntrypointEval`
- Remove import of `EntrypointEval`
- Add new route mappings:
  ```typescript
  ["/pg", EntrypointPg],
  ["/pg/grade/*", EntrypointGrade],
  ["/pg/analyze", EntrypointAnalyze],
  ["/pg/chat", EntrypointChat],
  ["/pg/grade/decks/:deckId", EntrypointDeckDetail],
  ```
- Set up redirect chain: `/pg` → `/pg/grade` → `/pg/grade/decks`

### 3. Update Server to Handle Entrypoint Redirects

In `apps/boltfoundry-com/server.tsx`:

Add logic to detect and handle redirect responses from entrypoints:

```typescript
// Before rendering React SSR, check if the entrypoint wants to redirect
if (matchedEntrypoint) {
  try {
    // Get the resolver from the entrypoint's reader artifact
    const resolver = matchedEntrypoint.readerArtifact?.resolver;

    // Call the resolver with minimal data to check if it returns a redirect
    const result = resolver ? resolver({ data: {} }) : null;

    if (result && result.status === 302 && result.headers?.Location) {
      // Return a redirect response
      return new Response(null, {
        status: 302,
        headers: {
          Location: result.headers.Location,
        },
      });
    }
  } catch (e) {
    // If we can't determine redirect status, continue with normal rendering
    logger.debug(`Could not check redirect status for ${url.pathname}:`, e);
  }
}
```

This allows the server to:

- Check if an entrypoint returns a redirect response
- Return the appropriate 302 redirect to the browser
- Fall back to normal rendering if no redirect is needed

### 4. Handle Client-Side Redirects

In `apps/boltfoundry-com/lib/BfIsographFragmentReader.tsx`:

- Add redirect handling for dev mode compatibility
- Handle the redirect chain properly in the client

## Component Architecture (Isograph Pattern)

### 1. Create Main Grade Component

Create `apps/boltfoundry-com/components/Grade.tsx`:

```typescript
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
  const DecksView = data?.currentViewer?.asCurrentViewerLoggedIn?.organization
    ?.DecksView;
  return <DecksView />;
});
```

### 2. Create DecksView Component

Create `apps/boltfoundry-com/components/Evals/Decks/DecksView.tsx`:

```typescript
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
```

### 3. Update DeckList Component

Modify `apps/boltfoundry-com/components/Evals/Decks/DeckList.tsx`:

- Remove `useState(mockDecks)`
- Replace with Isograph query:

```typescript
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
  const deckItems = data.decks?.edges?.map((edge) => edge.node.DecksListItem) ||
    [];
  // Render deck items...
});
```

### 4. Create DecksListItem Component

Create `apps/boltfoundry-com/components/Evals/Decks/DecksListItem.tsx`:

```typescript
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

### 5. Create BfDeckDetailView Component

Create `apps/boltfoundry-com/components/Evals/Decks/BfDeckDetailView.tsx`:

- Implement full deck detail view with samples display
- Query deck data including samples through Isograph

### 6. Create Placeholder Components

Create placeholder components for future phases:

- `apps/boltfoundry-com/components/Analyze.tsx` - Empty state
- `apps/boltfoundry-com/components/Chat.tsx` - Empty state

## Telemetry Handler Updates

In `apps/boltfoundry-com/handlers/telemetry.ts`:

- Update deck creation to include proper edge roles
- Ensure organization-deck linking uses correct edge metadata
- Add proper error handling for telemetry processing

## Context Updates

In `apps/boltfoundry-com/contexts/EvalContext.tsx`:

- Update to handle real GraphQL deck data
- Remove mock data dependencies
- Add proper data transformation from GraphQL format

## Build and Compilation

After making all changes:

1. Run `bft iso` to compile Isograph queries
2. Verify all generated files in `__generated__/__isograph/`
3. Ensure no TypeScript errors

## Testing

### Create E2E Test

Create `apps/boltfoundry-com/__tests__/e2e/fastpitch-telemetry.test.e2e.ts`:

- Test login flow
- Generate telemetry using BfClient
- Verify deck appears in dashboard
- Confirm deck contains real samples

### Verification Steps

1. Start dev server: `bft dev boltfoundry-com`
2. Run fastpitch: `bft fastpitch`
3. Navigate to dashboard and verify real decks appear
4. Click on deck to see detail view with samples
5. Run e2e test to verify entire flow

## Important Notes

- Do NOT pass props between Isograph components
- Each component fetches its own data
- Use "resolvers all the way down" pattern
- Remove all references to mock data
- Ensure all GraphQL queries include proper edge role filtering
- The old `EntrypointEval` and `/pg/eval` route are deprecated and should be
  removed
- The `Eval.tsx` component is still used but now loaded via
  `EntrypointGradeDecks`
