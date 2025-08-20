# Phase 4: Enforcement & Cleanup

[← Previous Phase](./phase-3-migration-adoption.md) |
[Back to README](./README.md) | [Next Phase →](./phase-5-type-system-many.md)

**Goal**: Ensure consistent usage going forward

**Related sections in README:**

- [Files to Modify](./README.md#files-to-modify)

## 1. Enable enforcement

- Enable lint rule to prevent direct `createTargetNode` usage
- Make `createTargetNode` protected
- Update developer documentation

## 2. Handle delete functionality

- Implement `BfEdge.delete()` if not already available
- Ensure `delete{RelationName}()` methods work correctly
- Add appropriate options (cascade delete, etc.)

## 3. Documentation & training

- Update bfDb documentation
- Create examples and best practices
- Train team on new patterns

## Documentation Topics

- How to use relationship methods
- When to use find vs findX
- When to use unlink vs delete
- Best practices for error handling
- Migration guide from old patterns

## Success Criteria for .one() Implementation

- All one-to-one relationships automatically get typed methods
- Zero runtime overhead for type safety
- Existing code migrated without breaking changes
- Developer experience improved with autocomplete and type checking
- Clear documentation and examples available

## Next Steps

1. **Run tests in parallel**:
   ```bash
   bft test apps/bfDb/
   bft lint infra/lint/
   bft lint apps/bfDb/
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
     [Phase 5: Type System for Many Relationships](./phase-5-type-system-many.md)
   - Begin implementing many relationship type system

**Important**: Do not proceed to Phase 5 until:

- Lint rules are enabled and preventing direct `createTargetNode` usage
- `createTargetNode` is properly protected
- Delete functionality works correctly
- Documentation is complete and accurate
- PR checks are green
