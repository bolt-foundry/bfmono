# Phase 3: GraphQL Integration

[← Previous Phase](./phase-2-cascade-delete.md) | [Back to README](./README.md)

**Goal**: Expose the delete functionality through GraphQL mutations and
integrate with the UI layer.

**Priority**: LOW - This provides API access but core functionality works
without it.

## Overview

Phase 3 makes the network delete capabilities available through the GraphQL API,
enabling frontend applications to leverage these features safely and
efficiently.

## GraphQL Schema Updates

### 1. Add Delete Mutations

Location: `apps/bfDb/graphql/schema.graphql` (or appropriate schema location)

```graphql
type Mutation {
  """
  Delete a node by ID with optional cascade deletion.
  Returns the number of nodes deleted.
  """
  deleteNode(
    nodeId: ID!
    options: DeleteNodeOptions
  ): DeleteNodeResult!
  
  """
  Delete multiple nodes in a single operation.
  Useful for batch cleanup operations.
  """
  deleteNodes(
    nodeIds: [ID!]!
    options: DeleteNodeOptions
  ): DeleteNodesResult!
}

input DeleteNodeOptions {
  """
  Delete nodes that become orphaned. Default: false
  """
  deleteOrphans: Boolean
  
  """
  Node IDs that should be preserved even if orphaned
  """
  preserveNodeIds: [ID!]
  
  """
  Maximum cascade depth. Default: 10
  """
  maxDepth: Int
  
  """
  Dry run - report what would be deleted without actually deleting
  """
  dryRun: Boolean
}

type DeleteNodeResult {
  """
  Whether the operation succeeded
  """
  success: Boolean!
  
  """
  Number of nodes deleted (including cascaded deletions)
  """
  deletedCount: Int!
  
  """
  IDs of all deleted nodes
  """
  deletedNodeIds: [ID!]!
  
  """
  Error message if operation failed
  """
  error: String
  
  """
  Warnings (e.g., max depth reached)
  """
  warnings: [String!]
}

type DeleteNodesResult {
  """
  Overall success (false if any deletion failed)
  """
  success: Boolean!
  
  """
  Total number of nodes deleted
  """
  totalDeleted: Int!
  
  """
  Results for each requested node
  """
  results: [DeleteNodeResult!]!
}
```

### 2. Implement Resolvers

Location: `apps/bfDb/graphql/resolvers/mutations.ts`

```typescript
export const deleteNodeResolver = async (
  _parent: unknown,
  args: {
    nodeId: string;
    options?: {
      deleteOrphans?: boolean;
      preserveNodeIds?: string[];
      maxDepth?: number;
      dryRun?: boolean;
    };
  },
  context: GraphQLContext,
): Promise<DeleteNodeResult> => {
  const { nodeId, options = {} } = args;
  const { currentViewer } = context;

  try {
    // Validate permissions
    const node = await BfNode.findByBfGid(currentViewer, nodeId);
    if (!node) {
      return {
        success: false,
        deletedCount: 0,
        deletedNodeIds: [],
        error: `Node ${nodeId} not found`,
      };
    }

    // Check delete permissions
    if (!await canDelete(currentViewer, node)) {
      return {
        success: false,
        deletedCount: 0,
        deletedNodeIds: [],
        error: "Insufficient permissions to delete this node",
      };
    }

    // Dry run if requested
    if (options.dryRun) {
      const result = await simulateDelete(node, options);
      return {
        success: true,
        deletedCount: result.wouldDelete.length,
        deletedNodeIds: result.wouldDelete,
        warnings: result.warnings,
      };
    }

    // Track deleted nodes
    const deletedTracker = new DeletedNodesTracker();

    // Perform deletion
    await node.delete({
      deleteOrphans: options.deleteOrphans || false,
      preserveNodeIds: new Set(options.preserveNodeIds || []),
      maxDepth: options.maxDepth || 10,
      onNodeDeleted: (id) => deletedTracker.add(id),
    });

    return {
      success: true,
      deletedCount: deletedTracker.count,
      deletedNodeIds: deletedTracker.ids,
      warnings: deletedTracker.warnings,
    };
  } catch (error) {
    logger.error("Delete node mutation failed:", error);
    return {
      success: false,
      deletedCount: 0,
      deletedNodeIds: [],
      error: error.message,
    };
  }
};

export const deleteNodesResolver = async (
  _parent: unknown,
  args: {
    nodeIds: string[];
    options?: DeleteNodeOptions;
  },
  context: GraphQLContext,
): Promise<DeleteNodesResult> => {
  const { nodeIds, options = {} } = args;
  const results: DeleteNodeResult[] = [];

  // Process deletions sequentially to handle dependencies
  for (const nodeId of nodeIds) {
    const result = await deleteNodeResolver(
      _parent,
      { nodeId, options },
      context,
    );
    results.push(result);

    // Stop on first failure if not in dry run
    if (!result.success && !options.dryRun) {
      break;
    }
  }

  const totalDeleted = results.reduce(
    (sum, r) => sum + r.deletedCount,
    0,
  );

  return {
    success: results.every((r) => r.success),
    totalDeleted,
    results,
  };
};
```

### 3. Add Permission Checks

```typescript
async function canDelete(
  viewer: CurrentViewer,
  node: BfNode,
): Promise<boolean> {
  // Check if viewer owns the node
  if (node.metadata.bfCid === viewer.userId) {
    return true;
  }

  // Check organization admin permissions
  if (await viewer.isOrgAdmin(node.metadata.bfOid)) {
    return true;
  }

  // Check specific delete permissions
  return viewer.hasPermission(
    `delete:${node.metadata.className}`,
    node.metadata.bfOid,
  );
}
```

## Frontend Integration

### 1. GraphQL Hooks

Create React hooks for delete operations:

```typescript
// apps/boltFoundry/hooks/useDeleteNode.ts
export function useDeleteNode() {
  const [deleteNode, { loading, error }] = useMutation(DELETE_NODE_MUTATION);

  const handleDelete = useCallback(
    async (
      nodeId: string,
      options?: DeleteNodeOptions,
    ): Promise<DeleteNodeResult> => {
      const { data } = await deleteNode({
        variables: { nodeId, options },
        update: (cache, { data }) => {
          // Remove deleted nodes from cache
          data.deleteNode.deletedNodeIds.forEach((id) => {
            cache.evict({ id: `Node:${id}` });
          });
          cache.gc();
        },
      });

      return data.deleteNode;
    },
    [deleteNode],
  );

  return {
    deleteNode: handleDelete,
    loading,
    error,
  };
}
```

### 2. Confirmation Dialog

```typescript
// apps/boltFoundry/components/DeleteConfirmDialog.tsx
interface DeleteConfirmDialogProps {
  node: BfNode;
  onConfirm: (options: DeleteNodeOptions) => Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  node,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [options, setOptions] = useState<DeleteNodeOptions>({
    deleteOrphans: false,
    dryRun: true,
  });

  const [preview, setPreview] = useState<DeleteNodeResult | null>(null);

  // Run dry run to show preview
  useEffect(() => {
    deleteNode(node.id, { ...options, dryRun: true })
      .then(setPreview)
      .catch(console.error);
  }, [node.id, options]);

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Delete {node.displayName}?</DialogTitle>

      <DialogContent>
        {preview && (
          <Alert severity={preview.warnings?.length ? "warning" : "info"}>
            This will delete {preview.deletedCount} node(s)
            {preview.warnings?.map((w) => <div key={w}>{w}</div>)}
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={options.deleteOrphans}
              onChange={(e) =>
                setOptions({
                  ...options,
                  deleteOrphans: e.target.checked,
                })}
            />
          }
          label="Delete orphaned nodes"
        />

        {options.deleteOrphans && preview && (
          <Typography variant="caption">
            {preview.deletedCount - 1} additional nodes will be deleted
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onConfirm(options)}
          color="error"
          variant="contained"
        >
          Delete {preview?.deletedCount || 1} node(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Testing

### 1. GraphQL Resolver Tests

```typescript
Deno.test("deleteNode mutation with permissions", async () => {
  const { client, viewer } = await createTestClient();
  const node = await createTestNode(viewer);

  const result = await client.mutate({
    mutation: DELETE_NODE_MUTATION,
    variables: {
      nodeId: node.id,
      options: { deleteOrphans: false },
    },
  });

  assertEquals(result.data.deleteNode.success, true);
  assertEquals(result.data.deleteNode.deletedCount, 1);
});

Deno.test("deleteNode mutation denies without permissions", async () => {
  const { client } = await createTestClient();
  const { viewer: otherViewer } = await createTestClient();
  const node = await createTestNode(otherViewer);

  const result = await client.mutate({
    mutation: DELETE_NODE_MUTATION,
    variables: { nodeId: node.id },
  });

  assertEquals(result.data.deleteNode.success, false);
  assert(result.data.deleteNode.error.includes("permissions"));
});

Deno.test("dry run reports correctly", async () => {
  const { client, viewer } = await createTestClient();

  // Create connected nodes
  const parent = await createTestNode(viewer);
  const child1 = await createTestNode(viewer);
  const child2 = await createTestNode(viewer);
  await parent.linkTo(child1);
  await parent.linkTo(child2);

  const result = await client.mutate({
    mutation: DELETE_NODE_MUTATION,
    variables: {
      nodeId: parent.id,
      options: {
        deleteOrphans: true,
        dryRun: true,
      },
    },
  });

  assertEquals(result.data.deleteNode.success, true);
  assertEquals(result.data.deleteNode.deletedCount, 3);

  // Verify nothing was actually deleted
  assertNotEquals(await findNode(parent.id), null);
});
```

### 2. UI Integration Tests

```typescript
// Using React Testing Library
test("delete confirmation shows preview", async () => {
  const node = createMockNode();
  const onConfirm = jest.fn();

  render(
    <MockedProvider
      mocks={[
        {
          request: {
            query: DELETE_NODE_MUTATION,
            variables: {
              nodeId: node.id,
              options: { deleteOrphans: false, dryRun: true },
            },
          },
          result: {
            data: {
              deleteNode: {
                success: true,
                deletedCount: 1,
                deletedNodeIds: [node.id],
                warnings: [],
              },
            },
          },
        },
      ]}
    >
      <DeleteConfirmDialog
        node={node}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    </MockedProvider>,
  );

  // Wait for dry run to complete
  await waitFor(() => {
    expect(screen.getByText(/This will delete 1 node/)).toBeInTheDocument();
  });

  // Toggle orphan deletion
  fireEvent.click(screen.getByLabelText(/Delete orphaned nodes/));

  // Verify button updates
  expect(screen.getByText(/Delete 1 node\(s\)/)).toBeInTheDocument();
});
```

## Security Considerations

### 1. Rate Limiting

Add rate limiting to prevent abuse:

```typescript
const deleteRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 deletes per minute per user
});

// In resolver
if (!await deleteRateLimiter.check(viewer.userId)) {
  throw new Error("Rate limit exceeded for delete operations");
}
```

### 2. Audit Logging

Log all delete operations for compliance:

```typescript
async function auditDelete(
  viewer: CurrentViewer,
  nodeId: string,
  result: DeleteNodeResult,
) {
  await AuditLog.create(viewer, {
    action: "node.delete",
    targetId: nodeId,
    metadata: {
      deletedCount: result.deletedCount,
      deletedNodeIds: result.deletedNodeIds,
      options: result.options,
    },
  });
}
```

### 3. Soft Delete Option

For sensitive data, consider soft delete:

```typescript
if (node.metadata.className === "SensitiveData") {
  // Mark as deleted instead of hard delete
  await node.update({ deletedAt: new Date() });
  return { success: true, deletedCount: 1, softDeleted: true };
}
```

## Deployment Checklist

- [ ] GraphQL schema updated and deployed
- [ ] Resolvers implemented with proper error handling
- [ ] Permission checks in place
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Frontend components tested
- [ ] Documentation updated
- [ ] Monitoring alerts configured

## Success Criteria

- [ ] GraphQL mutations work correctly
- [ ] Dry run provides accurate previews
- [ ] Permission checks prevent unauthorized deletions
- [ ] UI provides clear feedback about cascade effects
- [ ] Performance remains acceptable for large deletions
- [ ] Audit trail captures all delete operations

## Future Enhancements

1. **Undo functionality**: Store deleted data temporarily for recovery
2. **Scheduled deletion**: Queue deletions for off-peak processing
3. **Bulk operations UI**: Select multiple nodes for deletion
4. **Dependency visualization**: Show graph of what will be deleted
5. **Export before delete**: Option to export data before deletion
