# Phase 8: Many Relationship Migration

[← Previous Phase](./phase-7-advanced-many-features.md) |
[Back to README](./README.md)

**Goal**: Migrate existing many relationship patterns

**Related sections in README:**

- [Design Decision: Basic Relationships Only](./README.md#design-decision-basic-relationships-only)
- [Files to Modify](./README.md#files-to-modify)

## 1. Identify current patterns

- Manual edge creation for one-to-many
- Custom query methods
- Pagination implementations

## 2. Migration strategy

- Codemod for common patterns
- Preserve existing functionality
- Gradual adoption path

## Common Migration Patterns

### Manual Edge Creation

Before:

```typescript
const comment = await BfComment.create(cv, { text: "Great post!" });
await BfEdge.create(cv, post, "comments", comment);
```

After:

```typescript
const comment = await post.createComment({ text: "Great post!" });
```

### Custom Query Methods

Before:

```typescript
async function getPostComments(post: BfPost) {
  const edges = await BfEdge.query(cv)
    .where({ sourceId: post.id, type: "comments" })
    .all();
  return edges.map((e) => e.target);
}
```

After:

```typescript
const comments = await post.findAllComment();
```

### Pagination

Before:

```typescript
const edges = await BfEdge.query(cv)
  .where({ sourceId: post.id, type: "comments" })
  .limit(10)
  .after(cursor)
  .all();
```

After:

```typescript
const connection = await post.connectionForComment({
  first: 10,
  after: cursor,
});
```

## Success Criteria for .many() Implementation

- All one-to-many relationships automatically get typed methods
- Proper handling of collections with pagination support
- Efficient bulk operations available
- Seamless integration with existing .one() methods
- Type safety maintained throughout

## Next Steps

1. **Run tests in parallel**:
   ```bash
   bft test apps/bfDb/
   bft test apps/boltFoundry/
   bft lint .
   bft check .
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
   - All phases complete!
   - Automatic relationship methods are now available throughout the codebase

**Important**: Do not consider the project complete until:

- All existing many relationship patterns have been migrated
- Codemod has successfully updated all relevant code
- All tests pass after migration
- Performance is maintained or improved
- Documentation is updated with new patterns
- PR checks are green
