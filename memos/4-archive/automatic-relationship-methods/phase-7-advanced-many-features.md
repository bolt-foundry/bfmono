# Phase 7: Advanced Many Relationship Features

[← Previous Phase](./phase-6-runtime-implementation-many.md) |
[Back to README](./README.md) |
[Next Phase →](./phase-8-many-relationship-migration.md)

**Goal**: Add advanced features for many relationships

**Related sections in README:**

- [Key Differences Between .one() and .many()](./README.md#key-differences-between-one-and-many)

## 1. Enhanced filtering and ordering

- Extend `query{RelationName}()` with more advanced filtering capabilities
- Add support for complex query operations
- Type-safe filter predicates and operators

## 2. Batch operations

- `addMany{RelationName}([item1, item2])` for bulk operations - distinct from
  single `add{RelationName}()`
- `removeMany{RelationName}([item1, item2])` for bulk removal - distinct from
  single `remove{RelationName}()`
- `createMany{RelationName}([props1, props2])` for bulk creation
- Transaction support for atomicity

## 3. Performance optimizations

- Add `iterate{RelationName}()` method for lazy loading with async iterators
- Efficient queries for large collections
- Caching strategies
- Memory-efficient processing of large datasets

## Example Usage

```typescript
// Batch operations - note the distinct method names with 'Many' suffix
await post.addManyComment([comment1, comment2, comment3]);
await post.removeManyComment([comment1, comment2]);
await post.createManyComment([
  { text: "First comment", authorId: user1.id },
  { text: "Second comment", authorId: user2.id },
]);

// Advanced filtering with queryComment (singular)
const recentComments = await post.queryComment({
  where: { createdAt: { gte: lastWeek } },
  orderBy: { createdAt: "desc" },
  limit: 10,
});

// Future enhancement: Async iteration for large collections
// This would be an additional method beyond the core API
for await (const comment of post.iterateComment()) {
  // Process each comment without loading all into memory
}
```

## Implementation Considerations

- Batch operations should be atomic
- Consider database-specific optimizations
- Memory efficiency for large collections
- Progress reporting for long operations

## Success Criteria

- Batch operations work correctly
- Performance improvements measurable
- No memory issues with large collections
- Maintains type safety

## Next Steps

1. **Run tests in parallel**:
   ```bash
   bft test apps/bfDb/builders/bfDb/__tests__/relationshipMethods.test.ts
   bft test apps/bfDb/__tests__/performance/
   bft lint apps/bfDb/builders/bfDb/relationshipMethods.ts
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
     [Phase 8: Many Relationship Migration](./phase-8-many-relationship-migration.md)
   - Begin migrating existing many relationship patterns

**Important**: Do not proceed to Phase 8 until:

- Batch operations are working and atomic
- Performance optimizations show measurable improvements
- Memory efficiency is validated with large collections
- Async iteration patterns work correctly
- PR checks are green
