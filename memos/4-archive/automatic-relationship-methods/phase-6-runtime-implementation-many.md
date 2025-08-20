# Phase 6: Runtime Implementation for Many

[← Previous Phase](./phase-5-type-system-many.md) |
[Back to README](./README.md) |
[Next Phase →](./phase-7-advanced-many-features.md)

**Goal**: Implement runtime methods for many relationships

**Related sections in README:**

- [Example Usage](./README.md#example-usage)
- [For .many() relationships](./README.md#for-many-relationships)

## 1. Extend `generateRelationshipMethods()`

- Detect `.many()` relationships from node spec
- Generate appropriate methods with different signatures
- Handle pagination and filtering options

## 2. Runtime behavior tests:

```typescript
Deno.test("Create and find in many relationship", () => {
  // post.createComment({ text: "..." }) creates and links
  // post.findAllComment() returns all linked comments
  // Handle empty results gracefully
});

Deno.test("Add existing node to many relationship", () => {
  // post.addComment(existingComment) creates edge only
  // Should not duplicate if already linked
  // Verify edge creation without node creation
});

Deno.test("Remove from many relationship", () => {
  // post.removeComment(comment) removes edge only
  // post.deleteComment(comment) deletes node too
  // Handle non-existent relationships gracefully
});
```

## Implementation Details

### Method Signatures

- `findAll{RelationName}()`: Return all related nodes
- `query{RelationName}(args)`: Filter and sort with parameters
- `connectionFor{RelationName}(args)`: GraphQL-compatible connection
- `create{RelationName}(props)`: Create and link new node
- `add{RelationName}(node)`: Link existing node
- `remove{RelationName}(node)`: Remove from collection (edge only)
- `delete{RelationName}(node)`: Delete node and remove from collection

### Edge Cases

- Empty collections
- Duplicate prevention in `add`
- Non-existent nodes in `remove`/`delete`
- Proper transaction handling

## Success Criteria

- All `.many()` methods work correctly
- Proper handling of collections
- No duplicate edges
- Clear error messages

## Next Steps

1. **Run tests in parallel**:
   ```bash
   bft test apps/bfDb/builders/bfDb/__tests__/relationshipMethods.test.ts
   bft test apps/bfDb/
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
     [Phase 7: Advanced Many Relationship Features](./phase-7-advanced-many-features.md)
   - Begin implementing advanced features like batch operations

**Important**: Do not proceed to Phase 7 until:

- All `.many()` relationship methods are working correctly
- Collection handling is properly implemented
- Edge case scenarios are handled gracefully
- No duplicate edges are created
- PR checks are green
