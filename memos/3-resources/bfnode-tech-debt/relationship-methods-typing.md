# Fix BfNode `this` Relationships

## Problem

BfNode subclasses have relationship methods (like `createSamplesItem()`) added
dynamically at runtime via `generateRelationshipMethods(this)`, but TypeScript
doesn't know about these methods. This causes type errors when calling
relationship methods from within the class:

```typescript
// In BfDeck.ts - this fails type checking
async recordSample(telemetryData: TelemetryData) {
  const sample = await this.createSamplesItem({  // ❌ Property 'createSamplesItem' does not exist
    completionData,
    collectionMethod: "telemetry",
  });
}
```

Currently, tests work around this by casting to
`WithRelationships<typeof BfDeck>`.

## Solution

Implement automatic TypeScript declaration merging via codegen to make
relationship methods available on `this` without any manual code changes.

## Implementation Plan

### 1. Extend `bft genGqlTypes` Command

- Add relationship method declaration generation to the existing GraphQL type
  generation
- Analyze each BfNode subclass to extract relationship info from `bfNodeSpec`
- Generate TypeScript declaration merging for each node class

### 2. Generate Declaration Files

Create module augmentation that extends each BfNode class with its relationship
methods:

```typescript
// Auto-generated: nodeRelationships.d.ts
declare module "./nodeTypes/rlhf/BfDeck.ts" {
  interface BfDeck extends RelationshipMethods<typeof BfDeck> {}
}
declare module "./nodeTypes/rlhf/BfSample.ts" {
  interface BfSample extends RelationshipMethods<typeof BfSample> {}
}
```

### 3. Integration

- Hook into existing build pipeline
- Run automatically as part of `bft genGqlTypes`
- Ensure generated types are included in TypeScript compilation

## Benefits

- **Zero code changes** to existing BfNode files
- **Automatic type safety** for all relationship methods
- **Better developer experience** with proper IDE autocomplete
- **Eliminates manual casting** in tests and application code
- **Always up-to-date** - relationship changes automatically update types

## Success Criteria

- `this.createSamplesItem()` works in BfDeck methods without type errors
- All existing relationship method calls continue to work
- Tests no longer need `as WithRelationships<typeof BfDeck>` casts
- No manual changes required to BfNode class files
