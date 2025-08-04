# Automatic Relationship Methods for bfDb

## Problem

Currently, when working with bfDb relationships, developers need to manually
write boilerplate code for common operations like finding, creating, and
deleting related nodes. This leads to repetitive code and inconsistent patterns
across the codebase.

## Proposed Solution

Automatically generate relationship methods on bfDb nodes for both one-to-one
and one-to-many relationships.

### For `.one()` relationships:

- `find{RelationName}()` - Find the related node (returns null if not found)
- `findX{RelationName}()` - Find the related node (throws if not found)
- `create{RelationName}(props)` - Create and link a new related node
- `unlink{RelationName}()` - Remove the relationship (edge only)
- `delete{RelationName}()` - Delete the related node and relationship

### For `.many()` relationships:

- `findAll{RelationName}()` - Find all related nodes
- `query{RelationName}(args)` - Query related nodes with filters, ordering, and
  pagination
- `connectionFor{RelationName}(args)` - GraphQL connection with cursor-based
  pagination
- `create{RelationName}(props)` - Create and link a new related node
- `add{RelationName}(node)` - Link an existing node
- `remove{RelationName}(node)` - Remove a node from the relationship (edge only)
- `delete{RelationName}(node)` - Delete the node and remove from relationship

## Example Usage

```typescript
// Define nodes with relationships
class BfBook extends BfNode {
  static bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .one("author", () => BfPerson) // Multiple relationships
      .one("illustrator", () => BfPerson) // to the same type
      .many("review", () => BfReview) // Use singular for relationship name
  );
}

// Automatically generated methods for .one():
const book = await BfBook.findX(cv, bookId);

// Each relationship gets its own set of methods, even for the same target type
const author = await book.findAuthor(); // Returns BfPerson | null
const illustrator = await book.findIllustrator(); // Returns BfPerson | null

// Create and automatically link related nodes
const newAuthor = await book.createAuthor({ name: "Jane Smith" });
const newIllustrator = await book.createIllustrator({ name: "John Doe" });

// Remove just the relationship (edge only)
await book.unlinkAuthor();
await book.unlinkIllustrator();

// Delete the node and relationship
await book.deleteAuthor();
await book.deleteIllustrator();

// Automatically generated methods for .many():
const reviews = await book.findAllReview();
const topReviews = await book.queryReview({
  where: { rating: { gte: 4 } },
  orderBy: { createdAt: "desc" },
  limit: 10,
});
const reviewConnection = await book.connectionForReview({
  first: 20,
  after: "cursor123",
  where: { rating: { gte: 4 } },
});
const newReview = await book.createReview({ rating: 5, text: "Great!" });
await book.addReview(existingReview);
await book.removeReview(review); // Just removes from collection
await book.deleteReview(review); // Deletes the review node
```

## Design Decision: Basic Relationships Only

### What We Support

This feature supports basic relationships without roles or edge properties for
both:

- **One-to-one relationships** (`.one()`) - Single related node
- **One-to-many relationships** (`.many()`) - Multiple related nodes

### Why Not Extended Relationships?

While bfDb supports complex edges with roles and properties, we're explicitly
making this an anti-goal because:

1. **Complexity creep**: Supporting roles/edge properties would complicate the
   API and implementation significantly
2. **Unclear patterns**: There's no obvious "right way" to expose these in
   generated methods
3. **Escape hatch exists**: For complex relationships, developers can still use
   the lower-level bfDb APIs directly

### Recommendation

If you need relationships with roles or edge properties, don't use the generated
methods. Instead, use the existing bfDb query and edge creation APIs directly.
This keeps the generated methods simple and predictable for the 80% use case.

## Type Safety Implementation

The type system uses TypeScript's advanced type mapping features to
automatically generate method signatures based on relationship specifications.
This provides full type safety without requiring code generation or build steps.

### Key Types

The implementation is in
`/@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts`:

- **`RelationshipMethods<T>`** - Maps relationship specs to method signatures
- **`WithRelationships<T>`** - Augments BfNode instances with relationship
  methods
- **`OneRelationshipMethods<T>`** - Generates methods for `.one()` relationships
- **`ManyRelationshipMethods<T>`** - Generates methods for `.many()`
  relationships (Phase 5+)

### How It Works

1. When you define a relationship using `.one()` or `.many()`, the type system
   automatically generates the appropriate method signatures
2. BfNode's static methods (`findX`, `create`, `query`) return types that
   include these relationship methods
3. The runtime implementation in the constructor adds the actual methods to
   match the types

### Benefits

- **No code generation** - Types are computed automatically by TypeScript
- **Full IDE support** - Autocomplete, type checking, and refactoring work
  seamlessly
- **Zero runtime overhead** - Types are erased at compile time
- **Transparent to users** - Just define relationships and use the generated
  methods

## Current Implementation Status (as of 2025-08-03)

### ✅ Completed Phases

- **Phase 1: Type System Foundation** - Full TypeScript type safety implemented
- **Phase 2: Runtime Implementation** - Fully functional method generation with
  data persistence

### Implementation Details

All relationship methods are now fully functional using existing BfNode
infrastructure:

- `find{Name}()` - Uses `queryTargetInstances()` to find related nodes
- `create{Name}()` - Uses `createTargetNode()` for atomic create + link
- `unlink{Name}()` - Uses `BfEdge.query()` to find and delete edges
- `delete{Name}()` - Combines unlink and node deletion
- `findX{Name}()` - Throws `BfErrorNotFound` if relationship doesn't exist

### Testing Status

- **Unit Tests**: 7/7 passing - All tests pass with full functionality
- **Type Tests**: Working correctly, no manual type aliases needed
- **Lint & Type Check**: All passing

## Implementation Plan

The implementation is broken down into 8 phases:

### One-to-One Relationships (`.one()`)

1. **[Phase 1: Type System Foundation](./phase-1-type-system-foundation.md)** -
   ✅ Complete - Build the TypeScript type system
2. **[Phase 2: Runtime Implementation](./phase-2-runtime-implementation.md)** -
   ✅ Complete - Implement method generation
3. **[Phase 3: Migration & Adoption](./phase-3-migration-adoption.md)** - 📋
   Planned Migrate existing code
4. **[Phase 4: Enforcement & Cleanup](./phase-4-enforcement-cleanup.md)** - 📋
   Planned Ensure consistent usage

### One-to-Many Relationships (`.many()`)

5. **[Phase 5: Type System for Many](./phase-5-type-system-many.md)** - 📋
   Planned Extend types for collections
6. **[Phase 6: Runtime Implementation for Many](./phase-6-runtime-implementation-many.md)** -
   📋 Planned Implement collection methods
7. **[Phase 7: Advanced Many Features](./phase-7-advanced-many-features.md)** -
   📋 Planned Add batch operations and optimizations
8. **[Phase 8: Many Relationship Migration](./phase-8-many-relationship-migration.md)** -
   📋 Planned Migrate existing patterns

## Important Implementation Notes

### Transaction Context (cv) Parameter

The generated instance methods access the `CurrentViewer` from the node instance
itself, so cv is not needed as a parameter. The cv was already provided when the
node was loaded via static methods like `BfBook.findX(cv, id)`.

### Method Naming Convention

All generated methods use singular forms based on the relationship name:

- `findAllReview()` - find all reviews
- `queryReview()` - query reviews with filters
- `connectionForReview()` - get GraphQL connection for reviews
- `createReview()` - creates one review
- `addReview()` - adds one existing review
- `removeReview()` - removes one review
- `deleteReview()` - deletes one review

### Advanced Features (Phase 7+)

The following features will be added in Phase 7:

- **Batch operations**: `addManyReview([reviews])`,
  `removeManyReview([reviews])`
- **Async iteration**: `iterateReview()` for memory-efficient processing
- **Performance optimizations**: Caching, query batching, and connection pooling

### Error Handling

- `findX{RelationName}()` methods throw `NotFoundError` if the relationship
  doesn't exist
- All methods properly propagate database errors
- Transaction rollback is handled automatically on errors

## Key Differences Between `.one()` and `.many()`

- **Method names**: `findAll{RelationName}` vs `find{RelationName}`
- **Return types**: Arrays/iterators vs single items
- **Additional methods**:
  - `query{RelationName}()` for advanced filtering and sorting
  - `connectionFor{RelationName}()` for GraphQL-compatible connections
  - `add{RelationName}()` for linking existing nodes
- **Query parameters**: Object-based API matching GraphQL patterns
- **GraphQL integration**: Connection-based pagination with cursors
- **Pagination**: Built-in support for large collections
- **Filtering**: Type-safe query parameters through parameter objects

## Files Modified/Created

- `/@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts` - Complete
  implementation (types + runtime)
- `/@bfmono/apps/bfDb/classes/BfNode.ts` - Integration in constructor (line 360)
- `/@bfmono/apps/bfDb/builders/bfDb/__tests__/relationshipMethods.test.ts` -
  Runtime test coverage
- `/@bfmono/apps/bfDb/builders/bfDb/__tests__/relationshipTypes.test.ts` -
  Type-level test coverage
