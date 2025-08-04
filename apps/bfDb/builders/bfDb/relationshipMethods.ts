// Type System Foundation for Automatic Relationship Methods

// Import existing types from bfDb
import type {
  AnyBfNodeCtor,
  InferProps,
} from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { RelationSpec } from "@bfmono/apps/bfDb/builders/bfDb/types.ts";

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

// Placeholder for many relationships (Phase 5+)
// TODO(@bfmono/memos/1-projects/automatic-relationship-methods/phase-5-many-relationships-type-system.md): Implement many relationship types

// For now, RelationshipMethods only includes one-to-one relationships
export type RelationshipMethods<T extends AnyBfNodeCtor> =
  OneRelationshipMethods<T>;

// Combine with base type - return type for findX, create, etc.
export type WithRelationships<T extends AnyBfNodeCtor> =
  & InstanceType<T>
  & RelationshipMethods<T>;

// Runtime method generation
import type { BfNode, PropsBase } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { BfErrorNotFound, BfErrorNotImplemented } from "@bfmono/lib/BfError.ts";
import type { BfGid } from "@bfmono/lib/types.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

/**
 * Generates relationship methods on a BfNode instance based on its spec
 */
export function generateRelationshipMethods(node: BfNode): void {
  const nodeClass = node.constructor as AnyBfNodeCtor;
  const spec = (nodeClass as AnyBfNodeCtor & {
    bfNodeSpec?: { relations?: Record<string, unknown> };
  }).bfNodeSpec;

  if (!spec?.relations) {
    return;
  }

  for (const [relationName, relationSpec] of Object.entries(spec.relations)) {
    const typedRelationSpec = relationSpec as RelationSpec;
    if (typedRelationSpec.cardinality === "one") {
      generateOneRelationshipMethods(node, relationName, typedRelationSpec);
    } else if (typedRelationSpec.cardinality === "many") {
      // TODO: Implement in Phase 5-6
      // generateManyRelationshipMethods(node, relationName, typedRelationSpec);
    }
  }
}

/**
 * Generates methods for a .one() relationship
 */
function generateOneRelationshipMethods(
  node: BfNode,
  relationName: string,
  relationSpec: RelationSpec,
): void {
  const capitalizedName = capitalize(relationName);
  const targetClass = relationSpec.target() as typeof BfNode;

  // find{RelationName}() - Find the related node (returns null if not found)
  Object.defineProperty(node, `find${capitalizedName}`, {
    value: async function () {
      // Use queryTargetInstances to find related nodes
      const results = await node.queryTargetInstances(
        targetClass,
        {}, // nodeProps - no filtering
        { role: relationName }, // edgeProps - filter by relationship name
      );

      // For .one() relationships, return the first result or null
      return results.length > 0 ? results[0] : null;
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // findX{RelationName}() - Find the related node (throws if not found)
  Object.defineProperty(node, `findX${capitalizedName}`, {
    value: async function () {
      // Use queryTargetInstances to find related nodes
      const results = await node.queryTargetInstances(
        targetClass,
        {}, // nodeProps - no filtering
        { role: relationName }, // edgeProps - filter by relationship name
      );

      // For .one() relationships, throw if not found
      if (results.length === 0) {
        throw new BfErrorNotFound(
          `${capitalizedName} not found for ${node.constructor.name} ${node.id}`,
        );
      }
      return results[0];
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // create{RelationName}(props) - Create and link a new related node
  Object.defineProperty(node, `create${capitalizedName}`, {
    value: async function (props: Record<string, unknown>) {
      // Use createTargetNode which handles both node creation and edge linking
      return await node.createTargetNode(
        targetClass,
        props as PropsBase, // Cast to PropsBase for type compatibility
        { role: relationName }, // Pass relationship name as the edge role
      );
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // unlink{RelationName}() - Remove the relationship (edge only)
  Object.defineProperty(node, `unlink${capitalizedName}`, {
    value: async function () {
      // First find the related node(s) to get their IDs
      const results = await node.queryTargetInstances(
        targetClass,
        {}, // nodeProps - no filtering
        { role: relationName }, // edgeProps - filter by relationship name
      );

      if (results.length > 0) {
        // Extract the IDs of all related nodes
        const targetIds = results.map((result) => result.id as BfGid);

        try {
          // Use the built-in unlinkTargetInstances method
          await node.unlinkTargetInstances(targetIds, relationName);
        } catch (error) {
          // TODO: Remove this try/catch once PR #1807 implements BfNode.delete()
          // Currently edge.delete() throws BfErrorNotImplemented
          if (error instanceof BfErrorNotImplemented) {
            logger.warn(
              `Cannot unlink ${relationName} - edge.delete() not implemented. ` +
                `See PR #1807 for network delete implementation.`,
            );
          } else {
            throw error;
          }
        }
      }
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // delete{RelationName}() - Delete the related node and relationship
  Object.defineProperty(node, `delete${capitalizedName}`, {
    value: async function () {
      // Use queryTargetInstances to find related nodes
      const results = await node.queryTargetInstances(
        targetClass,
        {}, // nodeProps - no filtering
        { role: relationName }, // edgeProps - filter by relationship name
      );

      if (results.length > 0) {
        const relatedNode = results[0];

        // Delete the edge first
        try {
          await node.unlinkTargetInstances(
            [relatedNode.id as BfGid],
            relationName,
          );
        } catch (error) {
          // TODO: Remove this try/catch once PR #1807 implements BfNode.delete()
          // Currently edge.delete() throws BfErrorNotImplemented
          if (error instanceof BfErrorNotImplemented) {
            logger.warn(
              `Cannot unlink ${relationName} edge - edge.delete() not implemented. ` +
                `See PR #1807 for network delete implementation.`,
            );
          } else {
            throw error;
          }
        }

        // Then delete the node
        try {
          await relatedNode.delete();
        } catch (error) {
          // TODO: Remove this try/catch once PR #1807 implements BfNode.delete()
          // Currently delete() throws BfErrorNotImplemented
          if (error instanceof BfErrorNotImplemented) {
            logger.warn(
              `Cannot delete ${targetClass.name} node - BfNode.delete() not implemented. ` +
                `See PR #1807 for network delete implementation.`,
            );
          } else {
            throw error;
          }
        }
      }
    },
    writable: false,
    enumerable: false,
    configurable: true,
  });
}

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
