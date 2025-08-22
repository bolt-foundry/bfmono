# Backend: Node Query Pattern Implementation

## Overview

Implement a generic node query pattern in Isograph to support fetching
individual entities by ID. This enables clean routing to individual entity
detail views without prop drilling.

## Problem Statement

Current routing approach violates Isograph principles:

- Uses prop drilling to pass data to components
- Components receive pre-loaded data instead of fetching their own
- Creates "UI-only" wrapper components instead of self-contained Isograph
  components

## Solution: Generic BfNode Query Pattern

### Core Pattern

```typescript
// Generic bfNode query with type casting (working with existing BfNode interface)
field Query.BfNodeById @component {
  bfNode(id: $id) {
    asBfDeck {
      DeckDetailView
    }
    asBfSample {
      SampleDetailView  
    }
    asBfOrganization {
      OrganizationDetailView
    }
    // Add more BfNode types as needed
  }
}
```

### Implementation Structure

```typescript
export const BfNodeById = iso(`
  field Query.BfNodeById @component {
    bfNode(id: $id) {
      asBfDeck {
        DeckDetailView
      }
      asBfSample {
        SampleDetailView
      }
    }
  }
`)(function BfNodeById({ data }) {
  const node = data.bfNode;

  if (node?.asBfDeck) {
    const DeckView = node.asBfDeck.DeckDetailView;
    return <DeckView />;
  }

  if (node?.asBfSample) {
    const SampleView = node.asBfSample.SampleDetailView;
    return <SampleView />;
  }

  return <div>Entity not found or unsupported type</div>;
});
```

## Implementation Tasks

### Phase 1: Core Infrastructure

- [ ] Create `Query.BfNodeById` Isograph component
- [ ] Add `bfNode(id: ID!): BfNode` query to GraphQL schema
- [ ] Add `find` parameter to existing connection fields (e.g.,
      `samples(find: ID)`)
- [ ] Add basic type casting support for `asBfDeck`
- [ ] Test with simple deck detail view
- [ ] Update router to use bfNode query pattern

### Phase 2: Deck Detail Support

- [ ] Complete `BfDeck.DeckDetailView` Isograph component
- [ ] Implement `BfDeck.DeckSamplesList` component
- [ ] Add tab navigation support within Isograph components
- [ ] Handle empty states properly

### Phase 3: Sample Detail Support

- [ ] Add `asBfSample` casting to node query
- [ ] Create `BfSample.SampleDetailView` component
- [ ] Support sample detail routing

### Phase 4: Extended Type Support

- [ ] Add other entity types as needed (Organization, Grader, etc.)
- [ ] Implement error handling for unsupported types
- [ ] Add loading states

## Router Integration

### Current Approach (Problematic)

```typescript
// MainContentRouter.tsx - Current
if (isDeckDetailPageWithTab && tab && isDeckTab(tab)) {
  return (
    <DeckDetailView
      deckId={deckId} // Prop drilling
      deckName={getDeckNameById(deckId)} // Mock data
      currentTab={tab as DeckTab}
      samples={samples || []} // Pre-loaded data
      loading={loading} // External loading state
      // ... more props
    />
  );
}
```

### New Approach (Isograph Pattern)

```typescript
// MainContentRouter.tsx - New
if (isDeckDetailPageWithTab && deckId) {
  return <BfNodeById id={deckId} />;
}
```

## Benefits

1. **Follows Isograph Principles**
   - Components are self-contained and fetch their own data
   - No prop drilling between Isograph components
   - Clean separation of concerns

2. **Scalable Pattern**
   - Works for any entity type that implements Node interface
   - Easy to add new entity types
   - Consistent approach across the application

3. **Better Error Handling**
   - Centralized "not found" handling
   - Type-safe casting
   - Clear error states

4. **Simplified Routing**
   - Router just needs to pass ID
   - No complex data loading logic in router
   - Components handle their own loading states

## File Structure

```
apps/boltfoundry-com/isograph/components/
├── Query/
│   └── BfNodeById.tsx               # Generic bfNode query component
├── BfDeck/
│   ├── DeckDetailView.tsx          # Deck detail with tabs
│   ├── DeckSamplesList.tsx         # Samples list for deck
│   └── DecksListItem.tsx           # Existing deck list item
├── BfSample/
│   ├── SampleDetailView.tsx        # Individual sample view
│   └── SampleListItem.tsx          # Existing sample list item
```

## GraphQL Schema Requirements

### BfNode Interface (Already Exists)

Leverage existing BfNode interface that BfDeck and BfSample already implement:

```graphql
interface BfNode {
  id: ID!
}

type BfDeck implements BfNode {
  id: ID!
  name: String
  description: String
  samples(first: Int): SampleConnection
  # ... other fields (already implemented)
}

type BfSample implements BfNode {
  id: ID!
  name: String
  completionData: JSON
  # ... other fields (already implemented)
}
```

### BfNode Query (Needs Implementation)

```graphql
type Query {
  bfNode(id: ID!): BfNode
}
```

### Connection Filtering (Needs Implementation)

```graphql
type BfDeck implements BfNode {
  # ... existing fields
  samples(
    first: Int
    after: String
    before: String
    last: Int
    find: ID  # New parameter for finding specific sample by ID
  ): BfDeckSamplesConnection
}
```

## Migration Strategy

1. **Implement BfNodeById component first**
2. **Add `bfNode(id: ID!): BfNode` query to GraphQL backend**
3. **Convert deck detail view to use bfNode pattern**
4. **Test with existing E2E tests**
5. **Gradually migrate other entity detail views**
6. **Remove old prop-drilling components**

## Testing Considerations

- E2E tests should continue to work without modification
- Unit tests for BfNodeById component with different entity types
- Error handling tests for invalid IDs
- Loading state tests

## Future Extensions

### Parameterized Components

```typescript
field Query.BfNodeById @component {
  bfNode(id: $id) {
    asBfDeck {
      DeckDetailView(tab: $tab)  # Pass tab as parameter
    }
  }
}
```

### Nested Routing

```typescript
// Support routes like /decks/:deckId/samples/:sampleId using connection filtering
field Query.BfNodeById @component {
  bfNode(id: $deckId) {
    asBfDeck {
      samples(find: $sampleId, first: 1) {
        edges {
          node {
            SampleDetailView
          }
        }
      }
    }
  }
}
```

## Notes

- This pattern leverages the existing BfNode interface (already implemented)
- Only requires adding the `bfNode(id: ID!): BfNode` query to the backend
- BfDeck and BfSample already implement BfNode interface
- Consider caching strategies for frequently accessed bfNodes
- Error boundaries should be added for graceful failure handling

## Implementation Priority

**High Priority:**

- BfNodeById core infrastructure
- Add `bfNode` query to GraphQL backend
- Add `find` parameter to connection fields
- BfDeck support (needed for sample display feature)

**Medium Priority:**

- BfSample support
- Error handling improvements

**Low Priority:**

- Extended type support
- Advanced routing patterns
