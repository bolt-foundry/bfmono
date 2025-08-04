# Phase 1: Type System Foundation

[← Back to README](./README.md) |
[Next Phase →](./phase-2-runtime-implementation.md)

**Status**: ✅ Complete

**Goal**: Get the TypeScript types working correctly with full type safety and
autocomplete

**Related sections in README:**

- [Type Safety Implementation](./README.md#type-safety-implementation)
- [For .one() relationships](./README.md#for-one-relationships)

## What Was Actually Implemented

### 1. Type System Architecture

The type system was implemented in
`/@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts` as a complete solution
combining both types and runtime:

```typescript
// Helper type that converts union types to intersection types
// e.g., { a: 1 } | { b: 2 } becomes { a: 1 } & { b: 2 }
type UnionToIntersection<T> =
  (T extends unknown ? (args: T) => unknown : never) extends
    (args: infer R) => unknown ? R : never;

// Extract relation names from bfNodeSpec (static property)
type RelationNames<T extends AnyBfNodeCtor> = T extends
  { bfNodeSpec: { relations: infer R } } ? keyof R & string
  : never;

// Get the target type for a specific relation
type RelationTarget<T extends AnyBfNodeCtor, K extends string> = T extends
  { bfNodeSpec: { relations: Record<K, RelationSpec> } }
  ? T["bfNodeSpec"]["relations"][K] extends { target: () => infer Target }
    ? Target extends AnyBfNodeCtor ? Target : never
  : never
  : never;

// Detect relationship cardinality
type RelationCardinality<T extends AnyBfNodeCtor, K extends string> = T extends
  { bfNodeSpec: { relations: Record<K, infer R> } }
  ? R extends { cardinality: infer C } ? C : "one"
  : never;

// Generate method signatures for .one() relationships
type OneRelationshipMethods<T extends AnyBfNodeCtor> = UnionToIntersection<
  {
    [K in RelationNames<T>]: RelationCardinality<T, K> extends "one" ?
        & {
          [P in K as `find${Capitalize<P>}`]: () => Promise<
            InstanceType<RelationTarget<T, P>> | null
          >;
        }
        & {
          [P in K as `findX${Capitalize<P>}`]: () => Promise<
            InstanceType<RelationTarget<T, P>>
          >;
        }
        & {
          [P in K as `create${Capitalize<P>}`]: (
            props: InferProps<RelationTarget<T, P>>,
          ) => Promise<InstanceType<RelationTarget<T, P>>>;
        }
        & {
          [P in K as `unlink${Capitalize<P>}`]: () => Promise<void>;
        }
        & {
          [P in K as `delete${Capitalize<P>}`]: () => Promise<void>;
        }
      : never;
  }[RelationNames<T>]
>;

// Combine both relationship types (many relationships are Phase 5+)
export type RelationshipMethods<T extends AnyBfNodeCtor> =
  & OneRelationshipMethods<T>
  & ManyRelationshipMethods<T>;

// Final augmented type - return type for findX, create, etc.
export type WithRelationships<T extends AnyBfNodeCtor> =
  & InstanceType<T>
  & RelationshipMethods<T>;
```

The type system accomplishes several key things:

1. **Extracts relationship metadata** from the static `bfNodeSpec` property
2. **Generates method signatures** based on relationship names and target types
3. **Handles multiple relationships** to the same target type by using the
   relationship name in method names
4. **Provides full type safety** including parameter types for `create` methods
5. **Supports both nullable and non-nullable** return types (`find` vs `findX`)

### 2. Integration with BfNode

The key integration points in `/@bfmono/apps/bfDb/classes/BfNode.ts`:

- **Constructor Integration**: The `generateRelationshipMethods` function is
  called in the BfNode constructor (line 360)
- **Return Type Augmentation**: All static methods that return BfNode instances
  include the relationship methods:
  - `find()` returns
    `Promise<(InstanceType<TThis> & RelationshipMethods<TThis>) | null>`
  - `findX()` returns
    `Promise<InstanceType<TThis> & RelationshipMethods<TThis>>`
  - `__DANGEROUS__createUnattached()` returns
    `Promise<InstanceType<TThis> & RelationshipMethods<TThis>>`

### 3. Test Implementation

Two test files validate the implementation:

#### Type-level tests (`relationshipTypes.test.ts`)

```typescript
// Direct usage without any type aliases or casting
const book = await BfBook.findX(cv, "test-id" as BfGid);

// These all compile with correct types automatically
const author1: Promise<BfAuthor | null> = book.findAuthor();
const author2: Promise<BfAuthor> = book.findXAuthor();
const author3: Promise<BfAuthor> = book.createAuthor({
  name: "test",
  bio: "test bio",
});
const author4: Promise<void> = book.unlinkAuthor();
const author5: Promise<void> = book.deleteAuthor();

// TypeScript correctly enforces that findAuthor can return null
// but findXAuthor cannot
// @ts-expect-error - findAuthor returns BfAuthor | null, not BfAuthor
const wrongType: Promise<BfAuthor> = book.findAuthor();
```

#### Runtime tests (`relationshipMethods.test.ts`)

The runtime tests validate that:

- Methods are actually generated on instances
- They work with real data persistence
- Multiple relationships to the same type have separate methods
- No manual type casting is needed

Key test improvements:

- **No manual type aliases needed** - TypeScript automatically infers
  relationship methods
- **Direct method calls** - Changed from
  `(book as BfBookWithMethods).findAuthor()` to just `book.findAuthor()`
- **Tests work with real data** - Methods actually persist and retrieve data
- **Multiple relationships work correctly** - `book.findAuthor()` and
  `book.findIllustrator()` are separate

### 4. Key Design Decisions

1. **Unified Implementation File**: Both types and runtime are in the same file
   (`relationshipMethods.ts`)
2. **No CV Parameter**: Instance methods get CurrentViewer from the node
   instance itself
3. **Type Union to Intersection**: Uses `UnionToIntersection` helper to
   correctly merge method types
4. **Automatic Capitalization**: Method names automatically capitalize the
   relationship name
5. **Return Type Consistency**:
   - `find{Name}` returns `T | null`
   - `findX{Name}` returns `T` (throws if not found)
   - Other methods return `Promise<void>` or the created instance

### 5. What Works Now

- Full TypeScript type safety and autocomplete for all relationship methods
- No manual type definitions or aliases needed
- Methods are available on all BfNode instances returned from static methods
- Multiple relationships to the same target type have separate methods
- Circular and self-referential relationships are handled correctly
- Nodes without relationships don't have any extra methods

#### Example Usage

```typescript
// Define a node with relationships
class BfBook extends BfNode<{ title: string; isbn: string }> {
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => BfAuthor)
      .one("publisher", () => BfPublisher)
  );
}

// Use the automatically generated methods
const book = await BfBook.findX(cv, bookId);

// TypeScript knows all these methods exist with correct types
const author = await book.findAuthor(); // BfAuthor | null
const authorX = await book.findXAuthor(); // BfAuthor (throws if not found)
const newAuthor = await book.createAuthor({ // Creates and links
  name: "Jane Doe",
  bio: "Award-winning author",
});
await book.unlinkAuthor(); // Removes edge only
await book.deleteAuthor(); // Deletes author and edge

// Same for publisher relationship
const publisher = await book.findPublisher();
// ... etc
```

## Success Achieved

✅ All Phase 1 goals were completed:

- TypeScript types work correctly with full type safety
- `WithRelationships` type properly augments BfNode instances
- Method signatures are correctly generated for each relationship
- Return types are properly inferred from target nodes
- Instance methods access cv from the node instance
- Type definitions are in the correct location
- All tests pass without manual type aliases

## Lessons Learned

1. **Simpler is Better**: The final implementation is much simpler than the
   original plan suggested
2. **Combined Files Work Well**: Having types and runtime in the same file made
   the implementation cleaner
3. **TypeScript is Powerful**: The type system can handle complex mappings
   without external tooling
4. **Integration is Key**: Modifying BfNode's return types was essential for
   seamless usage

## What Was Different from the Original Plan

### Simplified Approach

The original plan suggested a more complex, iterative approach with mock types
and separate test files. The actual implementation was much simpler:

1. **No Mock Types Needed**: We went straight to implementing the real types
   that work with BfNode
2. **Single File Solution**: Instead of separate type files, everything lives in
   `relationshipMethods.ts`
3. **No Iterative Refinement**: The type system worked correctly on the first
   implementation
4. **Test Location**: Tests are in `builders/bfDb/__tests__/` not
   `types/__tests__/`

### What Wasn't Needed

- Creating mock node types for testing
- Separate type definition files
- Complex iteration on type extraction
- Manual validation steps before Phase 2

### Why It Was Simpler

1. **TypeScript's Power**: Modern TypeScript's type inference is powerful enough
   to handle the complexity without intermediate steps
2. **Existing Infrastructure**: BfNode already had the patterns we needed
   (static specs, type parameters)
3. **Clear Requirements**: The relationship spec structure was well-defined,
   making type extraction straightforward

## Next Phase

Phase 2 (Runtime Implementation) is also complete, with all methods fully
functional using existing BfNode infrastructure.
