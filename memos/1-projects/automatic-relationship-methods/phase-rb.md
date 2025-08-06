# Phase RB: Many() Builder and Query Implementation

## Overview

This phase implements the `.many()` relationship builder and all query
functionality for one-to-many relationships in bfDb. This builds on the existing
`.one()` relationship infrastructure to provide comprehensive collection-based
relationship methods.

## Scope

### 1. Builder System Extension

- Add `.many()` method to `FieldBuilder` in `makeFieldBuilder.ts`
- Enable defining one-to-many relationships: `.many("reviews", () => BfReview)`

### 2. Type System for Many Relationships

- Implement `ManyRelationshipMethods<T>` type in `relationshipMethods.ts`
- Generate method signatures for all `.many()` operations
- Integrate with existing `RelationshipMethods<T>` type

### 3. Runtime Method Generation

- Implement `generateManyRelationshipMethods()` function
- Generate all collection methods on node instances
- Use existing BfNode infrastructure (`queryTargetInstances`,
  `createTargetNode`, etc.)

### 4. Query and Connection Support

- Leverage existing `BfNode.connection()` for GraphQL-compatible pagination
- Support filtering, sorting, and pagination through query parameters
- Provide both simple and advanced query interfaces

## Implementation Plan

### Step 1: Builder Extension

**File**: `/apps/bfDb/builders/bfDb/makeFieldBuilder.ts`

Add `.many()` support to the FieldBuilder:

```typescript
export type FieldBuilder<F, R> = {
  // ... existing methods
  one: RelationAdder<"out", "one", F, R>;
  many: RelationAdder<"out", "many", F, R>; // Add this line
  readonly _spec: { fields: F; relations: R };
};

// In makeFieldBuilder function, add:
return {
  // ... existing methods
  one: addRel("out", "one"),
  many: addRel("out", "many"), // Add this line
  _spec: out,
} as FieldBuilder<F, R>;
```

### Step 2: Type System Implementation

**File**: `/apps/bfDb/builders/bfDb/relationshipMethods.ts`

Implement simple type support for `.many()` relationships:

```typescript
// Generate method signatures for .many() relationships (simplified)
type ManyRelationshipMethods<T extends AnyBfNodeCtor> = UnionToIntersection<
  {
    [K in RelationNames<T>]: RelationCardinality<T, K> extends "many" ?
        & {
          [P in K as `findAll${Capitalize<P>}`]: () => Promise<
            Array<InstanceType<RelationTarget<T, P>>>
          >;
        }
        & {
          [P in K as `connectionFor${Capitalize<P>}`]: (
            args?: ConnectionArguments & {
              where?: Partial<InferProps<RelationTarget<T, P>>>;
            },
          ) => Promise<Connection<InstanceType<RelationTarget<T, P>>>>;
        }
      : never;
  }[RelationNames<T>]
>;

// Update main type to include both one and many
export type RelationshipMethods<T extends AnyBfNodeCtor> =
  & OneRelationshipMethods<T>
  & ManyRelationshipMethods<T>;
```

### Step 3: Runtime Method Generation

**File**: `/apps/bfDb/builders/bfDb/relationshipMethods.ts`

Implement runtime generation for `.many()` methods (simplified):

```typescript
/**
 * Generates methods for a .many() relationship
 */
function generateManyRelationshipMethods(
  node: BfNode,
  relationName: string,
  relationSpec: RelationSpec,
): void {
  const capitalizedName = capitalize(relationName);
  const targetClass = relationSpec.target() as typeof BfNode;

  // findAll{RelationName}() - Find all related nodes
  Object.defineProperty(node, `findAll${capitalizedName}`, {
    value: async function () {
      return await node.queryTargetInstances(
        targetClass,
        {}, // no filtering
        { role: relationName }, // filter by relationship name
      );
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // connectionFor{RelationName}(args) - GraphQL connection support
  Object.defineProperty(node, `connectionFor${capitalizedName}`, {
    value: async function (args = {}) {
      const { where = {}, ...connectionArgs } = args;

      // Query and filter nodes
      const results = await node.queryTargetInstances(
        targetClass,
        where, // Apply where filtering
        { role: relationName }, // filter by relationship name
      );

      // Use existing BfNode.connection for cursor-based pagination
      return BfNode.connection(results, connectionArgs);
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });
}
```

### Step 4: Integration in generateRelationshipMethods

Update the main generation function to call the many methods:

```typescript
// In generateRelationshipMethods function, update the cardinality check:
if (typedRelationSpec.cardinality === "one") {
  generateOneRelationshipMethods(node, relationName, typedRelationSpec);
} else if (typedRelationSpec.cardinality === "many") {
  generateManyRelationshipMethods(node, relationName, typedRelationSpec); // Add this
}
```

## Example Usage After Implementation

```typescript
// Define a node with many relationships
class BfBook extends BfNode {
  static bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .one("author", () => BfPerson)
      .many("review", () => BfReview) // Now supported!
  );
}

// Use the generated methods
const book = await BfBook.findX(cv, bookId);

// Find all reviews
const allReviews = await book.findAllReview();

// Query with filtering and sorting
const topReviews = await book.queryReview({
  where: { rating: { gte: 4 } },
  orderBy: { createdAt: "desc" },
  limit: 10,
});

// Get GraphQL connection for pagination
const reviewConnection = await book.connectionForReview({
  first: 20,
  after: "cursor123",
  where: { rating: { gte: 4 } },
});

// Create new review and link it
const newReview = await book.createReview({
  rating: 5,
  text: "Great book!",
});

// Link existing review
await book.addReview(existingReview);

// Remove from collection (edge only)
await book.removeReview(someReview);

// Delete review node entirely
await book.deleteReview(someReview);
```

## Testing Strategy

### Unit Tests

Create comprehensive tests in `/apps/bfDb/builders/bfDb/__tests__/`:

1. **Type Tests** - Verify method signatures are generated correctly
2. **Runtime Tests** - Test all generated methods work properly
3. **Query Tests** - Test filtering, sorting, and pagination
4. **Connection Tests** - Test GraphQL connection integration
5. **Edge Cases** - Empty collections, invalid queries, etc.

### Test Files to Create/Update

- `relationshipMethods.many.test.ts` - Runtime tests for many relationships
- `relationshipTypes.many.test.ts` - Type-level tests for many relationships
- Update existing test files to include many relationship test cases

## Dependencies and Infrastructure

### Existing Infrastructure Used

- `BfNode.queryTargetInstances()` - Core querying capability
- `BfNode.createTargetNode()` - Node creation and linking
- `BfNode.unlinkTargetInstances()` - Edge removal
- `BfNode.connection()` - GraphQL connection support
- `BfEdge.create()` - Edge creation for `add{Name}()` methods

### External Dependencies

- `graphql-relay` types (already used) - For `ConnectionArguments` interface
- No new external dependencies required

## Implementation Order

1. **Builder Extension** (Step 1) - Enable `.many()` in field builder
2. **Type System** (Step 2) - Implement full TypeScript support
3. **Runtime Generation** (Step 3) - Implement method generation
4. **Integration** (Step 4) - Wire everything together
5. **Testing** - Comprehensive test coverage

## Files Modified

- `/apps/bfDb/builders/bfDb/makeFieldBuilder.ts` - Add `.many()` support
- `/apps/bfDb/builders/bfDb/relationshipMethods.ts` - Add many relationship
  types and runtime
- `/apps/bfDb/builders/bfDb/__tests__/relationshipMethods.many.test.ts` - New
  test file
- `/apps/bfDb/builders/bfDb/__tests__/relationshipTypes.many.test.ts` - New test
  file

## Success Criteria

✅ **Builder Support**: `.many("reviews", () => BfReview)` works in node specs\
✅ **Type Safety**: All generated methods have correct TypeScript signatures\
✅ **Runtime Function**: Both many relationship methods work correctly\
✅ **Query Support**: Basic filtering and pagination work as expected\
✅ **Connection Support**: GraphQL connections work with cursor pagination\
✅ **Test Coverage**: All functionality covered by unit tests\
✅ **Integration**: Works seamlessly with existing `.one()` relationships

## Future Enhancements (Out of Scope)

- Batch operations (`addManyReview([reviews])`, `removeManyReview([reviews])`)
- Async iteration (`iterateReview()` for memory-efficient processing)
- Performance optimizations (caching, query batching, connection pooling)
- Advanced querying (complex WHERE conditions, joins, aggregations)

These will be addressed in Phase 7: Advanced Many Features.
