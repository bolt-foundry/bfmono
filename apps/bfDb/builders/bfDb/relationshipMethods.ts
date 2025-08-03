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
type ManyRelationshipMethods<T extends AnyBfNodeCtor> = Record<
  PropertyKey,
  never
>;

// Combine both relationship types
export type RelationshipMethods<T extends AnyBfNodeCtor> =
  & OneRelationshipMethods<T>
  & ManyRelationshipMethods<T>;

// Combine with base type - return type for findX, create, etc.
export type WithRelationships<T extends AnyBfNodeCtor> =
  & InstanceType<T>
  & RelationshipMethods<T>;
