# Phase 2: Network Delete with Worker Queue

[← Previous Phase](./phase-1-basic-delete.md) | [Back to README](./README.md) |
[Next Phase →](./phase-3-graphql-integration.md)

**Goal**: Implement full network delete functionality with edge cleanup and
orphan detection using the worker queue.

**Priority**: MEDIUM - Important for data integrity but not blocking immediate
functionality.

⚠️ **BLOCKED**: This phase requires the worker queue system (PR #1808) to be
completed first.

## Overview

Phase 2 replaces the simple delete from Phase 1 with a complete network delete
implementation that:

1. **Always cleans up edges** (fixes the Phase 1 limitation)
2. **Optionally deletes orphaned nodes** (cascade delete)
3. **Runs through the worker queue** for reliable async processing
4. **Provides progress updates** for long-running operations

## Design Considerations

### Default Behavior

- **Cascade deletion is OFF by default** for safety
- Users must explicitly opt-in with `deleteOrphans: true`
- This prevents accidental data loss in production

### Orphan Detection Algorithm

A node is considered orphaned when:

1. All its edges connect only to deleted nodes
2. It's not in the preserve list
3. It has no other relationships keeping it alive

## Worker Queue Integration

When the worker queue is available, cascade delete will work as follows:

1. **Initial request** creates a worker job and returns a job ID
2. **Worker processes** the deletion in the background:
   - Analyzes the graph to find orphans
   - Reports progress through the job status API
   - Handles failures gracefully with partial rollback
3. **Client polls** for status or receives webhooks on completion

## Implementation Steps

### 1. Update DeleteOptions Interface

Extend the interface from Phase 1:

```typescript
export interface DeleteOptions {
  /**
   * Skip edge cleanup when edges are already handled externally.
   */
  skipEdgeCleanup?: boolean;

  /**
   * Delete nodes that become orphaned after this deletion.
   * Default: false for safety.
   */
  deleteOrphans?: boolean;

  /**
   * Node IDs that should never be deleted, even if orphaned.
   */
  preserveNodeIds?: Set<BfGid>;

  /**
   * Maximum depth to traverse when looking for orphans.
   * Prevents runaway cascades. Default: 10.
   */
  maxDepth?: number;
}
```

### 2. Enhance BfNode.delete() Method

```typescript
async delete(options?: DeleteOptions): Promise<boolean> {
  const { 
    skipEdgeCleanup = false,
    deleteOrphans = false,
    preserveNodeIds = new Set<BfGid>(),
    maxDepth = 10
  } = options || {};
  
  try {
    const deletedNodes: BfGid[] = [];
    
    // Use internal helper for recursive deletion
    await this._deleteWithCascade(
      this.metadata.bfGid,
      {
        skipEdgeCleanup,
        deleteOrphans,
        preserveNodeIds,
        maxDepth,
        deletedNodes,
        depth: 0
      }
    );
    
    if (deleteOrphans && deletedNodes.length > 1) {
      logger.info(
        `Cascade delete completed. Deleted ${deletedNodes.length} nodes total`
      );
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to delete node ${this.metadata.bfGid}:`, error);
    throw error;
  }
}
```

### 3. Implement Cascade Logic

Add private helper method:

```typescript
private async _deleteWithCascade(
  nodeId: BfGid,
  context: {
    skipEdgeCleanup: boolean;
    deleteOrphans: boolean;
    preserveNodeIds: Set<BfGid>;
    maxDepth: number;
    deletedNodes: BfGid[];
    depth: number;
  }
): Promise<void> {
  // Prevent infinite recursion
  if (context.depth >= context.maxDepth) {
    logger.warn(`Max cascade depth ${context.maxDepth} reached`);
    return;
  }
  
  // Skip if already processed or preserved
  if (context.deletedNodes.includes(nodeId) || 
      context.preserveNodeIds.has(nodeId)) {
    return;
  }
  
  // Find all edges before deletion
  const connectedNodes: Set<BfGid> = new Set();
  
  if (!context.skipEdgeCleanup || context.deleteOrphans) {
    const [outgoingEdges, incomingEdges] = await Promise.all([
      this.findOutgoingEdges(),
      this.findIncomingEdges(),
    ]);
    
    // Collect connected node IDs for orphan checking
    [...outgoingEdges, ...incomingEdges].forEach(edge => {
      const meta = edge.metadata as BfEdgeMetadata;
      if (meta.bfSid !== nodeId) connectedNodes.add(meta.bfSid);
      if (meta.bfTid !== nodeId) connectedNodes.add(meta.bfTid);
    });
    
    // Delete edges if needed
    if (!context.skipEdgeCleanup) {
      await Promise.all(
        [...outgoingEdges, ...incomingEdges].map(edge => 
          bfDeleteItem(this.metadata.bfOid, edge.metadata.bfGid)
        )
      );
    }
  }
  
  // Delete the node itself
  await bfDeleteItem(this.metadata.bfOid, nodeId);
  context.deletedNodes.push(nodeId);
  
  // Check for orphans if enabled
  if (context.deleteOrphans && connectedNodes.size > 0) {
    const orphanCheckPromises = Array.from(connectedNodes).map(
      async (connectedNodeId) => {
        if (await this._isOrphaned(connectedNodeId, context.deletedNodes)) {
          // Load the orphaned node and delete it recursively
          const orphanNode = await BfNode.findByBfGid(
            this.currentViewer,
            connectedNodeId
          );
          
          if (orphanNode) {
            await orphanNode._deleteWithCascade(
              connectedNodeId,
              { ...context, depth: context.depth + 1 }
            );
          }
        }
      }
    );
    
    await Promise.all(orphanCheckPromises);
  }
}
```

### 4. Implement Orphan Detection

```typescript
private async _isOrphaned(
  nodeId: BfGid,
  deletedNodes: BfGid[]
): Promise<boolean> {
  // Find all edges for the potentially orphaned node
  const nodeToCheck = await BfNode.findByBfGid(this.currentViewer, nodeId);
  if (!nodeToCheck) return false;
  
  const [outgoing, incoming] = await Promise.all([
    nodeToCheck.findOutgoingEdges(),
    nodeToCheck.findIncomingEdges(),
  ]);
  
  // Check if any edge connects to a non-deleted node
  for (const edge of [...outgoing, ...incoming]) {
    const meta = edge.metadata as BfEdgeMetadata;
    const otherNodeId = meta.bfSid === nodeId ? meta.bfTid : meta.bfSid;
    
    if (!deletedNodes.includes(otherNodeId)) {
      // This node has a connection to a live node
      return false;
    }
  }
  
  // All connections are to deleted nodes - it's orphaned
  return true;
}
```

## Testing Plan

### 1. Unit Tests for Orphan Detection

```typescript
Deno.test("delete with orphan detection removes connected orphans", async () => {
  const cv = await createTestViewer();

  // Create a chain: A -> B -> C
  const nodeA = await TestNode.create(cv, { name: "A" });
  const nodeB = await TestNode.create(cv, { name: "B" });
  const nodeC = await TestNode.create(cv, { name: "C" });

  await nodeA.linkTo(nodeB);
  await nodeB.linkTo(nodeC);

  // Delete A with orphan detection
  await nodeA.delete({ deleteOrphans: true });

  // All nodes should be deleted
  assertEquals(await TestNode.findByBfGid(cv, nodeA.id), null);
  assertEquals(await TestNode.findByBfGid(cv, nodeB.id), null);
  assertEquals(await TestNode.findByBfGid(cv, nodeC.id), null);
});

Deno.test("preserveNodeIds prevents orphan deletion", async () => {
  const cv = await createTestViewer();

  // Create a chain: A -> B -> C
  const nodeA = await TestNode.create(cv, { name: "A" });
  const nodeB = await TestNode.create(cv, { name: "B" });
  const nodeC = await TestNode.create(cv, { name: "C" });

  await nodeA.linkTo(nodeB);
  await nodeB.linkTo(nodeC);

  // Delete A but preserve B
  await nodeA.delete({
    deleteOrphans: true,
    preserveNodeIds: new Set([nodeB.id]),
  });

  // A is deleted, B is preserved, C is orphaned and deleted
  assertEquals(await TestNode.findByBfGid(cv, nodeA.id), null);
  assertNotEquals(await TestNode.findByBfGid(cv, nodeB.id), null);
  assertEquals(await TestNode.findByBfGid(cv, nodeC.id), null);
});
```

### 2. Complex Graph Tests

```typescript
Deno.test("handles circular references correctly", async () => {
  const cv = await createTestViewer();

  // Create circular graph: A -> B -> C -> A
  const nodeA = await TestNode.create(cv, { name: "A" });
  const nodeB = await TestNode.create(cv, { name: "B" });
  const nodeC = await TestNode.create(cv, { name: "C" });

  await nodeA.linkTo(nodeB);
  await nodeB.linkTo(nodeC);
  await nodeC.linkTo(nodeA);

  // Delete any node should delete all in the cycle
  await nodeA.delete({ deleteOrphans: true });

  assertEquals(await TestNode.findByBfGid(cv, nodeA.id), null);
  assertEquals(await TestNode.findByBfGid(cv, nodeB.id), null);
  assertEquals(await TestNode.findByBfGid(cv, nodeC.id), null);
});

Deno.test("respects maxDepth limit", async () => {
  const cv = await createTestViewer();

  // Create a long chain
  const nodes = [];
  for (let i = 0; i < 20; i++) {
    const node = await TestNode.create(cv, { name: `Node${i}` });
    nodes.push(node);

    if (i > 0) {
      await nodes[i - 1].linkTo(node);
    }
  }

  // Delete first node with limited depth
  await nodes[0].delete({
    deleteOrphans: true,
    maxDepth: 5,
  });

  // Only first 5 nodes should be deleted
  for (let i = 0; i < 5; i++) {
    assertEquals(await TestNode.findByBfGid(cv, nodes[i].id), null);
  }

  // Rest should still exist
  for (let i = 5; i < 20; i++) {
    assertNotEquals(await TestNode.findByBfGid(cv, nodes[i].id), null);
  }
});
```

## Performance Considerations

### Optimization Opportunities

1. **Batch edge queries**: Instead of querying edges for each node separately,
   batch queries
2. **Early termination**: Stop traversing if no orphans are found at current
   level
3. **Caching**: Cache edge queries within a single delete operation
4. **Parallel processing**: Process orphan checks in parallel with limits

### Monitoring

Add metrics for:

- Number of nodes deleted in cascade operations
- Depth of cascade operations
- Time taken for large cascades
- Frequency of hitting maxDepth limit

## Migration Notes

- Phase 2 is backward compatible with Phase 1
- Existing delete calls continue to work without cascade
- No database schema changes required
- Can be rolled out gradually

## Success Criteria

- [ ] Orphan detection correctly identifies disconnected nodes
- [ ] Cascade deletion respects preserve lists
- [ ] Circular references are handled without infinite loops
- [ ] Performance is acceptable for graphs up to 1000 nodes
- [ ] maxDepth prevents runaway cascades

## Next Steps

Once cascade delete is stable, proceed to
[Phase 3: GraphQL Integration](./phase-3-graphql-integration.md) to expose these
capabilities through the API.
