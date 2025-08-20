# Phase 3: Migration & Adoption

[← Previous Phase](./phase-2-runtime-implementation.md) |
[Back to README](./README.md) | [Next Phase →](./phase-4-enforcement-cleanup.md)

**Goal**: Safely migrate existing code to use generated methods

**Related sections in README:**

- [Design Decision: Basic Relationships Only](./README.md#design-decision-basic-relationships-only)

## 1. Audit current usage

- Add disabled lint rule to identify `createTargetNode` usage
- Generate report of all locations that need updating
- Identify any special cases or blockers

## 2. Create migration tooling

- Write codemod to automatically update existing code
- Handle common patterns and edge cases
- Provide manual migration guide for complex cases

## 3. Execute migration

- Run codemod on codebase
- Manually review and test changes
- Update any documentation or examples

## Migration Patterns

### Before:

```typescript
// Current pattern: createTargetNode with class and props
const author = await book.createTargetNode(BfAuthor, {
  name: "Jane",
});
```

### After:

```typescript
// Generated method: relationship name in method, cv comes from instance
const author = await book.createAuthor({ name: "Jane" });
```

### Note on createTargetNode Signature

The actual `createTargetNode` signature in BfNode.ts is:

```typescript
createTargetNode<TProps>(TargetNodeClass, props, options?)
```

Not the incorrect pattern shown in some examples with a string relationship name
as the first parameter.

## Success Criteria

- All existing code migrated
- No breaking changes
- Tests continue to pass
- Clear migration documentation

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
   - Proceed to
     [Phase 4: Enforcement & Cleanup](./phase-4-enforcement-cleanup.md)
   - Begin implementing enforcement mechanisms and documentation

**Important**: Do not proceed to Phase 4 until:

- All existing `createTargetNode` usage has been migrated
- Codemod has been tested and works correctly
- All tests pass after migration
- No breaking changes introduced
- PR checks are green
