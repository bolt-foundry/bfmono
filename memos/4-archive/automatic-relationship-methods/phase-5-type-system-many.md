# Phase 5: Type System for Many Relationships

[← Previous Phase](./phase-4-enforcement-cleanup.md) |
[Back to README](./README.md) |
[Next Phase →](./phase-6-runtime-implementation-many.md)

**Goal**: Extend the type system to handle one-to-many relationships

**Related sections in README:**

- [For .many() relationships](./README.md#for-many-relationships)
- [Key Differences Between .one() and .many()](./README.md#key-differences-between-one-and-many)

## 1. Extend type definitions

- Add `ManyRelationshipMethods<T>` type for `.many()` relationships
- All methods use **singular forms** based on the relationship name:
  - `findAll{RelationName}()` - Find all related nodes
  - `query{RelationName}()` - Query with filters/sorting
  - `connectionFor{RelationName}()` - GraphQL connection
  - `create{RelationName}()` - Create one related node
  - `add{RelationName}()` - Link one existing node
  - `remove{RelationName}()` - Unlink one node
  - `delete{RelationName}()` - Delete one node
- Return types:
  - `findAll`: `Promise<Array<T>>`
  - `query`: `Promise<Array<T>>`
  - `connectionFor`: `Promise<Connection<T>>`
  - `create/add`: `Promise<T>`

## 2. Type test scenarios for `.many()`:

```typescript
Deno.test("Basic many relationship", () => {
  // Node with .many("comment", () => BfComment)
  // Should have findAllComment(), queryComment(), connectionForComment(), createComment(), addComment(), removeComment()
  // findAllComment() returns Promise<BfComment[]>
  // queryComment(args) accepts query parameters and returns Promise<BfComment[]>
  // connectionForComment(args) returns GraphQL connection type
  // Instance methods access cv from the node instance
});

Deno.test("Query parameters for many relationships", () => {
  // queryComment({ where: { authorId: "123" }, orderBy: { createdAt: "desc" }, limit: 10 })
  // Accepts parameter object with type-safe filtering
  // where: type-safe filter conditions based on node properties
  // orderBy: type-safe field and direction
  // limit/offset: pagination support
  // Returns Promise<BfComment[]> with filtered results
});

Deno.test("GraphQL connection for many relationships", () => {
  // connectionForComment({ first: 10, after: "cursor" })
  // Accepts standard GraphQL connection arguments
  // Returns typed connection: { edges: [...], pageInfo: {...}, totalCount }
  // Edge type includes node and cursor
  // Integrates with existing graphql-relay Connection types
});

Deno.test("Mixed one and many relationships", () => {
  // Node with both .one() and .many() relationships
  // All methods should coexist without conflicts
  // Proper type inference for each relationship type
});
```

## Type Definitions

Add to `apps/bfDb/builders/bfDb/relationshipMethods.ts`:

```typescript
// Import connection types from graphql-relay
import type { Connection } from "graphql-relay";

// Query parameter types
type QueryArgs<T> = {
  where?: Partial<InferProps<T>>;
  orderBy?: { [K in keyof InferProps<T>]?: "asc" | "desc" };
  limit?: number;
  offset?: number;
};

type ConnectionArgs = {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  where?: any; // Same as QueryArgs where clause
};

// Detect cardinality from RelationSpec
type RelationCardinality<T extends AnyBfNodeCtor, K extends string> = T extends
  { bfNodeSpec: { relations: Record<K, infer R> } }
  ? R extends { cardinality: infer C } ? C : "one"
  : never;

// Generate methods for .many() relationships
type ManyRelationshipMethods<T extends AnyBfNodeCtor> = UnionToIntersection<
  RelationNames<T> extends string
    ? RelationCardinality<T, RelationNames<T>> extends "many" ?
        & {
          [K in RelationNames<T> as `findAll${Capitalize<K>}`]: () => Promise<
            Array<InstanceType<RelationTarget<T, K>>>
          >;
        }
        & {
          [K in RelationNames<T> as `query${Capitalize<K>}`]: (
            args: QueryArgs<RelationTarget<T, K>>,
          ) => Promise<Array<InstanceType<RelationTarget<T, K>>>>;
        }
      // ... other methods
    : never
    : never
>;
```

- Extend existing `RelationshipMethods<T>` to combine
  `OneRelationshipMethods<T>` and `ManyRelationshipMethods<T>`
- Create proper return types for connections using graphql-relay types
- Ensure parameter types are properly inferred from node specs
- Use consistent singular naming for all methods

## Success Criteria

- Type safety for all `.many()` methods
- Proper inference of collection types
- GraphQL connection types work correctly
- No conflicts with `.one()` methods

## Next Steps

1. **Run tests in parallel**:
   ```bash
   bft test apps/bfDb/builders/bfDb/__tests__/relationshipTypes.test.ts
   bft test apps/bfDb/
   bft lint apps/bfDb/builders/bfDb/types/
   bft check apps/bfDb/
   ```

2. **Format code**:
   ```bash
   bft format
   ```

3. **Commit changes**:
   ```bash
   bft commit
   ```

4. **Submit PR**:
   ```bash
   sl pr submit
   ```

5. **Monitor PR**:
   - Watch the pull request for CI check results
   - Fix any issues that arise
   - If fixes needed:
     ```bash
     bft amend
     sl pr submit
     ```

6. **Once all checks pass**:
   - Proceed to
     [Phase 6: Runtime Implementation for Many](./phase-6-runtime-implementation-many.md)
   - Begin implementing runtime methods for many relationships

**Important**: Do not proceed to Phase 6 until:

- All type definitions for `.many()` relationships are working
- `ManyRelationshipMethods<T>` types are properly defined
- GraphQL connection types are correctly typed
- Mixed one and many relationships work without conflicts
- PR checks are green
