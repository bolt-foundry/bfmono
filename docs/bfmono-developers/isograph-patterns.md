# Isograph Patterns and Best Practices

## Core Philosophy

Isograph follows a "resolvers all the way down" pattern where components are
self-contained and fetch their own data. This guide documents the patterns we
use at Bolt Foundry.

## External Resources

### Official Documentation

- [Isograph Documentation](https://isograph.dev/) - Official docs
- [Quickstart Guide](https://isograph.dev/docs/quickstart/) - Getting started
- [Introduction](https://isograph.dev/docs/introduction/) - Core concepts
- [Blog](https://isograph.dev/blog/) - Latest updates and deep dives

### Examples and Demos

- [Isograph GitHub Repository](https://github.com/isographlabs/isograph) -
  Source code and examples
- Pokemon Vite Demo - Check the `/demos` directory in the main repo for Vite
  configuration examples
- [Quickstart Repository](https://github.com/isographlabs/quickstart) - Simple
  example app

### Key Concepts from Docs

- **Data Masking**: Components don't see each other's data
- **Automatic Query Generation**: Compiler generates GraphQL queries
- **Client Fields**: Components defined as fields on GraphQL types
- **Loadable Fields**: Lazy-loading with `@loadable` directive

## 1. Component Independence

### ❌ Anti-Pattern: Prop Drilling

```typescript
// Parent fetches all data and passes down
export const Parent = iso(`
  field Query.Parent @component {
    organization {
      decks { ... }
      samples { ... }
      graders { ... }
    }
  }
`)(function Parent({ data }) {
  return <Child decks={data.decks} samples={data.samples} />;
});
```

### ✅ Pattern: Self-Contained Components

```typescript
// Each component fetches only what it needs
export const Parent = iso(`
  field Query.Parent @component {
    organization {
      ChildComponent  // Reference to child component
    }
  }
`)(function Parent({ data }) {
  const ChildComponent = data.organization.ChildComponent;
  return <ChildComponent />;
});
```

## 2. Routing Architecture

### Separate Entrypoints Pattern

Instead of one monolithic entrypoint with internal routing, create separate
entrypoints for each major route:

```typescript
// routes.ts
export const isographAppRoutes = new Map([
  ["/pg/grade/*", entrypointGrade], // Grade entrypoint
  ["/pg/analyze", entrypointAnalyze], // Analyze entrypoint
  ["/pg/chat", entrypointChat], // Chat entrypoint
]);

// EntrypointGrade.ts
export const EntrypointGrade = iso(`
  field Query.EntrypointGrade {
    Grade
  }
`)(function EntrypointGrade({ data }) {
  const Body = data.Grade;
  return { Body, title: "Grade - Bolt Foundry" };
});
```

**Benefits:**

- Better code splitting (only load what's needed)
- True component independence
- No complex routing logic inside components
- Cleaner architecture

## 3. Component Hierarchy Pattern

For list views, use a three-level hierarchy:

```typescript
// Level 1: View Component (on Organization)
export const DecksView = iso(`
  field Organization.DecksView @component {
    DeckList
  }
`)(function DecksView({ data }) {
  return (
    <div className="decks-view">
      <h2>Decks</h2>
      <data.DeckList />
    </div>
  );
});

// Level 2: List Component (on Organization)
export const DeckList = iso(`
  field Organization.DeckList @component {
    decks(first: 100) {
      edges {
        node {
          DecksListItem  // Reference to item component
        }
      }
    }
  }
`)(function DeckList({ data }) {
  const items = data.decks?.edges?.map((edge) => edge.node.DecksListItem) || [];
  return (
    <div className="decks-list">
      {items.map((Item, i) => <Item key={i} />)}
    </div>
  );
});

// Level 3: Item Component (on the entity type)
export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
    description
  }
`)(function DecksListItem({ data }) {
  return (
    <div className="deck-item">
      <h4>{data.name}</h4>
      <p>{data.description}</p>
    </div>
  );
});
```

## 4. Naming Conventions

### Component Fields

- Use descriptive names that indicate the component's purpose
- For list items, use plural form: `DecksListItem` not `DeckListItem`
- For views, append `View`: `DecksView`, `AnalyzeView`

### File Organization

```
components/
  Grade.tsx           # Top-level route component
  DecksView.tsx       # View component (field on Organization)
  DeckList.tsx        # List component (field on Organization)
  DecksListItem.tsx   # Item component (field on BfDeck)
entrypoints/
  EntrypointGrade.ts  # Route entrypoint
```

## 5. Data Fetching

### Fetch Only What You Need

```typescript
// ❌ Bad: Fetching unused fields
field Organization.DeckList @component {
  decks(first: 100) {
    edges {
      node {
        id
        name
        description
        samples { ... }  # Not needed for list view
        graders { ... }  # Not needed for list view
      }
    }
  }
}

// ✅ Good: Minimal data for the view
field Organization.DeckList @component {
  decks(first: 100) {
    edges {
      node {
        DecksListItem  # Item component fetches what it needs
      }
    }
  }
}
```

## 6. Navigation Pattern

Handle navigation at the lowest level possible:

```typescript
export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
  }
`)(function DecksListItem({ data }) {
  const { navigate } = useRouter();

  const handleClick = () => {
    navigate(`/pg/grade/decks/${data.id}`);
  };

  return (
    <div onClick={handleClick}>
      {data.name}
    </div>
  );
});
```

## 7. Empty States

Handle empty states at the appropriate level:

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
  const items = data.decks?.edges?.map((edge) => edge.node.DecksListItem) || [];

  if (items.length === 0) {
    return (
      <BfDsEmptyState
        icon="deck"
        title="No decks yet"
        description="Create your first deck to get started"
      />
    );
  }

  return (
    <div className="decks-list">
      {items.map((Item, i) => <Item key={i} />)}
    </div>
  );
});
```

## 8. Type Safety

The Isograph compiler generates types, but you can add additional type safety:

```typescript
import type { DecksListItem as DecksListItemType } from "./__generated__/DecksListItem";

export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
  }
`)(function DecksListItem({ data }: { data: DecksListItemType }) {
  // TypeScript now knows the shape of data
  return <div>{data.name}</div>;
});
```

## 9. Feature Flags and Progressive Enhancement

When migrating or adding features, use feature flags:

```typescript
export const DeckList = iso(`
  field Organization.DeckList @component {
    decks(first: 100) { ... }
  }
`)(function DeckList({ data }) {
  const enableSearch = false; // Feature flag

  return (
    <>
      {enableSearch && <SearchBar />}
      <div className="decks-list">
        {/* list items */}
      </div>
    </>
  );
});
```

## 10. Testing Considerations

Isograph components are easier to test because they're self-contained:

```typescript
// Each component can be tested in isolation
// Mock only the data it directly uses
const mockData = {
  decks: {
    edges: [
      { node: { DecksListItem: MockDecksListItem } },
    ],
  },
};
```

## Common Pitfalls to Avoid

1. **Don't pass data between Isograph components** - Let each fetch its own
2. **Don't create "UI-only" wrapper components** - Make them Isograph components
3. **Don't fetch data you won't use** - Be minimal
4. **Don't handle routing at high levels** - Push it down to where the action
   happens
5. **Don't forget to run `bft iso`** - The compiler needs to generate the
   queries

## Migration Strategy

When converting existing components:

1. Start from the leaves (list items)
2. Work your way up to containers
3. Finally update the entrypoints
4. Keep feature flags for gradual rollout
5. Remove prop drilling as you go

## Summary

The key insight is that Isograph components should be:

- **Self-contained**: Fetch their own data
- **Composable**: Reference other components as fields
- **Minimal**: Only fetch what they need
- **Independent**: No prop passing between components

This creates a cleaner, more maintainable architecture that scales well with
application complexity.
