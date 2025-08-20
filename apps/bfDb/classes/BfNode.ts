import { GraphQLNode } from "./GraphQLNode.ts";
import type { FieldBuilder } from "@bfmono/apps/bfDb/builders/bfDb/makeFieldBuilder.ts";
import { GraphQLInterface } from "@bfmono/apps/bfDb/graphql/decorators.ts";

import type { BfGid } from "@bfmono/lib/types.ts";
import type { GraphqlNode } from "@bfmono/apps/bfDb/graphql/helpers.ts";
import type { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { storage } from "@bfmono/apps/bfDb/storage/storage.ts";
import type { DbItem } from "@bfmono/apps/bfDb/bfDb.ts";
import type { JSONValue } from "@bfmono/apps/bfDb/bfDb.ts";
import { bfDeleteItem } from "@bfmono/apps/bfDb/bfDb.ts";
import { BfErrorNodeNotFound } from "@bfmono/apps/bfDb/classes/BfErrorsBfNode.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { generateUUID } from "@bfmono/lib/generateUUID.ts";
import { connectionFromArray } from "graphql-relay";
import type { Connection, ConnectionArguments } from "graphql-relay";
import type {
  FieldSpec,
  RelationSpec,
} from "@bfmono/apps/bfDb/builders/bfDb/types.ts";
import type {
  RelationshipMethods,
} from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";
import {
  generateRelationshipMethods,
} from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";
import { makeBfDbSpec } from "@bfmono/apps/bfDb/builders/bfDb/makeBfDbSpec.ts";

const logger = getLogger(import.meta);

export type ConcreteBfNodeBaseCtor<
  TProps extends Record<string, JSONValue>,
> = new (
  cv: CurrentViewer,
  props: TProps,
  metadata?: Partial<BfMetadata>,
) => BfNode<TProps>;

export type BfNodeMetadata = {
  /** Global ID */
  bfGid: BfGid;
  bfOid: BfGid;
  className: string;
  sortValue: number;
  bfCid: BfGid;
  createdAt: Date;
  lastUpdated: Date;
};

export type PropsBase = Record<string, JSONValue>;

export type BfEdgeMetadata = BfNodeMetadata & {
  bfSid: BfGid;
  bfSClassName: string;
  bfTid: BfGid;
  bfTClassName: string;
};

export type BfNodeCache<
  TProps extends PropsBase,
  T extends BfNode<TProps> = BfNode<TProps>,
> = Map<
  BfGid | string,
  T
>;

export type BfMetadata = BfNodeMetadata | BfEdgeMetadata;

type FieldValue<S> = S extends { kind: "string" } ? string
  : S extends { kind: "number" } ? number
  : S extends { kind: "json" } ? JSONValue
  : never;

// deno-lint-ignore no-explicit-any
export type AnyBfNodeCtor<T extends BfNode<any> = BfNode<any>> = abstract new (
  // deno-lint-ignore no-explicit-any
  ...args: any
) => T;

type PropsFromFieldSpec<F extends Record<string, FieldSpec>> = {
  [K in keyof F]: FieldValue<F[K]>;
};
export type InferProps<T extends AnyBfNodeCtor> = T extends
  { bfNodeSpec: { fields: infer F extends Record<string, FieldSpec> } }
  ? PropsFromFieldSpec<F>
  : never;

@GraphQLInterface({
  name: "BfNode",
  description: "Base interface for all Bolt Foundry database nodes",
})
// deno-lint-ignore ban-types
export abstract class BfNode<TProps extends PropsBase = {}>
  extends GraphQLNode {
  protected _savedProps: TProps;
  protected _metadata: BfMetadata;
  readonly currentViewer: CurrentViewer;
  // We inherit the base gqlSpec from GraphQLNode with the id field
  // Define the GraphQL spec first to avoid a linting error
  static override gqlSpec = this.defineGqlNode((gql) => gql.nonNull.id("id"));
  static bfNodeSpec = this.defineBfNode((i) => i);
  static defineBfNode<
    F extends Record<string, FieldSpec>,
    R extends Record<string, RelationSpec> = Record<string, RelationSpec>,
  >(
    builder: (
      // deno-lint-ignore ban-types
      f: FieldBuilder<{}, {}>,
    ) => FieldBuilder<F, R>,
  ): { fields: F; relations: R } {
    return makeBfDbSpec<F, R>(builder);
  }

  static generateSortValue() {
    return Date.now();
  }

  static generateMetadata<
    TProps extends PropsBase,
    TThis extends typeof BfNode<TProps>,
  >(
    this: TThis,
    cv: CurrentViewer,
    metadata?: Partial<BfMetadata>,
  ): BfMetadata {
    const bfGid = generateUUID() as BfGid;
    const now = new Date();
    const defaults: BfMetadata = {
      bfGid: bfGid,
      bfOid: cv.orgBfOid,
      className: this.name,
      sortValue: this.generateSortValue(),
      bfCid: cv.personBfGid,
      createdAt: now,
      lastUpdated: now,
    };
    return { ...defaults, ...metadata };
  }

  static async query<
    TProps extends Record<string, JSONValue>,
    TThis extends typeof BfNode<TProps>,
  >(
    this: TThis,
    cv: CurrentViewer,
    metadata: Partial<BfMetadata>,
    props: Partial<TProps>,
    bfGids: Array<BfGid>,
    cache?: BfNodeCache<TProps>,
    options: {
      useSizeLimit?: boolean;
      cursorValue?: number | string;
      maxSizeBytes?: number;
      batchSize?: number;
      totalLimit?: number;
      countOnly?: boolean;
    } = {},
  ): Promise<Array<InstanceType<TThis> & RelationshipMethods<TThis>>> {
    const items = await storage.query(
      metadata,
      props,
      bfGids,
      "ASC",
      "sort_value",
      options,
    );

    return items.map((item) => {
      const Ctor = this as unknown as ConcreteBfNodeBaseCtor<TProps>;
      const instance = new Ctor(
        cv,
        item.props as TProps,
        item.metadata,
      );
      cache?.set(item.metadata.bfGid, instance);
      return instance as InstanceType<TThis> & RelationshipMethods<TThis>;
    });
  }

  static connection<T extends BfNode>(
    nodes: Array<T>,
    args: ConnectionArguments,
  ): Connection<T> {
    const { first, last, after, before } = args;

    // If no pagination args, return simple connection
    if (!first && !last && !after && !before) {
      return connectionFromArray(nodes, {});
    }

    // Helper function to get sort value from a node
    const getSortValue = (node: T): string => {
      // Access sortValue through metadata, fallback to id
      return String(node.metadata?.sortValue || node.id);
    };

    // For array-based connections with pagination args, implement cursor logic
    const sortedNodes = [...nodes].sort((a, b) => {
      // Sort by sortValue if available, otherwise by id
      const aSort = getSortValue(a);
      const bSort = getSortValue(b);
      return aSort.localeCompare(bSort);
    });

    let startIndex = 0;
    let endIndex = sortedNodes.length;

    // Handle cursor-based filtering
    if (after) {
      const afterIndex = sortedNodes.findIndex((node) => {
        const nodeSort = getSortValue(node);
        return nodeSort > after;
      });
      if (afterIndex !== -1) startIndex = afterIndex;
    }

    if (before) {
      const beforeIndex = sortedNodes.findIndex((node) => {
        const nodeSort = getSortValue(node);
        return nodeSort >= before;
      });
      if (beforeIndex !== -1) endIndex = beforeIndex;
    }

    // Apply first/last limits
    if (first !== undefined && first !== null) {
      endIndex = Math.min(startIndex + first, endIndex);
    }

    if (last !== undefined && last !== null) {
      startIndex = Math.max(endIndex - last, startIndex);
    }

    const paginatedNodes = sortedNodes.slice(startIndex, endIndex);

    // Generate proper cursors and pageInfo
    const hasNextPage = endIndex < sortedNodes.length;
    const hasPreviousPage = startIndex > 0;

    const startCursor = paginatedNodes.length > 0
      ? getSortValue(paginatedNodes[0])
      : null;
    const endCursor = paginatedNodes.length > 0
      ? getSortValue(paginatedNodes[paginatedNodes.length - 1])
      : null;

    return {
      edges: paginatedNodes.map((node) => ({
        cursor: getSortValue(node),
        node,
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor,
        endCursor,
      },
    };
  }

  static override async find<
    TProps extends PropsBase,
    TThis extends typeof BfNode<TProps>,
  >(
    this: TThis,
    cv: CurrentViewer,
    id: BfGid,
    cache?: BfNodeCache<TProps>,
  ): Promise<(InstanceType<TThis> & RelationshipMethods<TThis>) | null> {
    const cachedItem = cache?.get(id);
    if (cachedItem) {
      return cachedItem as InstanceType<TThis> & RelationshipMethods<TThis>;
    }
    try {
      const result = await this.findX(cv, id, cache);
      if (result) {
        if (cache) {
          cache.set(id, result);
        }
        return result;
      }
    } catch (e) {
      if (e instanceof BfErrorNodeNotFound) {
        logger.debug(`Node not found: ${id}`);
      } else {
        throw e;
      }
    }
    return null;
  }

  static override async findX<
    TProps extends PropsBase,
    TThis extends typeof BfNode<TProps>,
  >(
    this: TThis,
    cv: CurrentViewer,
    id: BfGid,
    cache?: BfNodeCache<TProps>,
  ): Promise<InstanceType<TThis> & RelationshipMethods<TThis>> {
    logger.debug(`findX: ${this.name} ${id} ${cv}`);
    const itemFromCache = cache?.get(id);
    if (itemFromCache) {
      return itemFromCache as InstanceType<TThis> & RelationshipMethods<TThis>;
    }
    const itemFromDb = await storage.get(cv.orgBfOid, id);
    if (!itemFromDb) {
      logger.debug("couldn't find item", cv.orgBfOid, id);
      throw new BfErrorNodeNotFound();
    }
    logger.debug(`Found ${this.name} with id ${id}`);
    const Ctor = this as unknown as ConcreteBfNodeBaseCtor<TProps>;
    const item = new Ctor(
      cv,
      itemFromDb.props as TProps,
      itemFromDb.metadata as BfMetadata,
    );
    cache?.set(id, item);
    return item as InstanceType<TThis> & RelationshipMethods<TThis>;
  }

  static async __DANGEROUS__createUnattached<
    TProps extends PropsBase,
    TThis extends typeof BfNode<TProps>,
  >(
    this: TThis,
    cv: CurrentViewer,
    props: TProps,
    metadata?: Partial<BfMetadata>,
    cache?: BfNodeCache<TProps>,
  ): Promise<InstanceType<TThis> & RelationshipMethods<TThis>> {
    logger.debug(
      `Creating unattached ${this.name} with props ${JSON.stringify(props)}`,
    );
    // indirection is because we're "newing" an abstract class, but it's actually a concrete subclass
    const Ctor = this as unknown as ConcreteBfNodeBaseCtor<TProps>;
    const newNode = new Ctor(cv, props, metadata) as InstanceType<TThis>;
    await newNode.beforeCreate();
    await newNode.save();
    await newNode.afterCreate();
    logger.debug(`Created ${newNode}`);
    cache?.set(newNode.metadata.bfGid, newNode);
    return newNode as InstanceType<TThis> & RelationshipMethods<TThis>;
  }

  constructor(
    currentViewer: CurrentViewer,
    protected _props: TProps,
    metadata?: Partial<BfMetadata>,
  ) {
    super();
    this._savedProps = { ..._props };
    this._metadata = (this.constructor as typeof BfNode).generateMetadata(
      currentViewer,
      metadata,
    );
    this.currentViewer = currentViewer;

    // Generate relationship methods
    generateRelationshipMethods(this);
  }

  get props(): TProps {
    return this._props;
  }

  set props(newProps: Partial<TProps>) {
    this._props = { ...this._props, ...newProps };
  }

  get metadata(): BfMetadata {
    return this._metadata;
  }

  get cv(): CurrentViewer {
    return this.currentViewer;
  }

  isDirty() {
    return JSON.stringify(this._props) !== JSON.stringify(this._savedProps);
  }

  /**
   * Implement the id getter required by the Node interface.
   * Returns the bfGid from the node's metadata.
   * If metadata or bfGid is missing, returns undefined.
   * Note: In practice, this should never happen as metadata with bfGid
   * is always initialized in the constructor.
   */
  override get id(): string {
    return this.metadata?.bfGid;
  }

  override toGraphql(): GraphqlNode {
    const descriptors = Object.getOwnPropertyDescriptors(this);
    const skip = new Set(["metadata", "cv", "props"]);

    const getters = Object.entries(descriptors)
      .filter(([k, d]) => typeof d.get === "function" && !skip.has(k))
      // deno-lint-ignore no-explicit-any
      .map(([k]) => [k, (this as any)[k]]);

    return {
      // deno-lint-ignore no-explicit-any
      ...(this as any).props,
      ...Object.fromEntries(getters),
      // Explicitly include id since it's an inherited getter
      id: this.id,
      __typename: this.__typename,
    };
  }

  override toString() {
    return `${this.constructor.name}#${this.metadata.bfGid}⚡️${this.metadata.bfOid}`;
  }

  async save() {
    this.metadata.lastUpdated = new Date();
    logger.debug(`Saving ${this}`, this.props, this.metadata);
    await storage.put(this.props, this.metadata);
    this._savedProps = this._props;
    return this;
  }

  /**
   * Delete this node from the database.
   *
   * NOTE: Phase 1 implementation - does NOT clean up edges.
   * This is sufficient for relationship methods which handle edges separately.
   * Full network delete with edge cleanup will be added in Phase 2.
   *
   * @returns true if the node was successfully deleted
   */
  async delete(): Promise<boolean> {
    try {
      await bfDeleteItem(this.metadata.bfOid, this.metadata.bfGid);
      return true;
    } catch (error) {
      logger.error(`Failed to delete node ${this.metadata.bfGid}:`, error);
      throw error;
    }
  }

  async load(): Promise<this> {
    const item = await storage.get(this.cv.orgBfOid, this.metadata.bfGid);
    if (!item) {
      throw new BfErrorNodeNotFound();
    }
    this._props = item.props as TProps;
    this._savedProps = this._props;
    this._metadata = item.metadata;
    return this;
  }

  /**
   * @deprecated Use the generated relationship methods instead (e.g., createDecksItem, createSamplesItem)
   *
   * This method is intended for internal use by the relationship methods.
   * For creating related nodes, use the type-safe relationship methods that are
   * automatically generated based on your node's relationships.
   *
   * @internal
   */
  async createTargetNode<TProps extends PropsBase>(
    TargetNodeClass: typeof BfNode<TProps>,
    props: TProps,
    options?: {
      role?: string;
      metadata?: Partial<BfMetadata>;
    },
  ): Promise<
    & InstanceType<typeof TargetNodeClass>
    & RelationshipMethods<typeof TargetNodeClass>
  > {
    const targetNode = await TargetNodeClass.__DANGEROUS__createUnattached(
      this.cv,
      props,
      options?.metadata,
    );

    await targetNode.save();

    const { BfEdge } = await import("@bfmono/apps/bfDb/nodeTypes/BfEdge.ts");
    await BfEdge.createBetweenNodes(
      this.cv,
      this,
      targetNode,
      { role: options?.role || "" },
    );

    return targetNode;
  }

  async queryAncestorsByClassName<
    TSourceClass extends typeof BfNode<TSourceProps>,
    TSourceProps extends PropsBase = PropsBase,
  >(
    SourceClass: TSourceClass,
    limit: number = 10,
    cache?: BfNodeCache<TSourceProps>,
  ): Promise<Array<InstanceType<TSourceClass>>> {
    const { bfQueryAncestorsByClassName } = await import(
      "@bfmono/apps/bfDb/bfDb.ts"
    );
    const results = await bfQueryAncestorsByClassName<TSourceProps>(
      this.cv.orgBfOid,
      this.metadata.bfGid,
      SourceClass.name,
      limit,
    );

    return results.map((item: DbItem<TSourceProps>) => {
      const Ctor = SourceClass as unknown as ConcreteBfNodeBaseCtor<
        TSourceProps
      >;
      const instance = new Ctor(this.cv, item.props, item.metadata);
      cache?.set(item.metadata.bfGid, instance);
      return instance as InstanceType<TSourceClass>;
    });
  }

  queryAncestorsByClass<
    TSourceClass extends typeof BfNode<TSourceProps>,
    TSourceProps extends PropsBase = PropsBase,
  >(
    SourceClass: TSourceClass,
    limit: number = 10,
    cache?: BfNodeCache<TSourceProps>,
  ): Promise<Array<InstanceType<TSourceClass>>> {
    return this.queryAncestorsByClassName(SourceClass, limit, cache);
  }

  async queryDescendantsByClassName<
    TTargetClass extends typeof BfNode<TTargetProps>,
    TTargetProps extends PropsBase = PropsBase,
  >(
    TargetClass: TTargetClass,
    limit: number = 10,
    cache?: BfNodeCache<TTargetProps>,
  ): Promise<Array<InstanceType<TTargetClass>>> {
    const { bfQueryDescendantsByClassName } = await import(
      "@bfmono/apps/bfDb/bfDb.ts"
    );
    const results = await bfQueryDescendantsByClassName<TTargetProps>(
      this.cv.orgBfOid,
      this.metadata.bfGid,
      TargetClass.name,
      limit,
    );

    return results.map((item: DbItem<TTargetProps>) => {
      const Ctor = TargetClass as unknown as ConcreteBfNodeBaseCtor<
        TTargetProps
      >;
      const instance = new Ctor(this.cv, item.props, item.metadata);
      cache?.set(item.metadata.bfGid, instance);
      return instance as InstanceType<TTargetClass>;
    });
  }

  queryDescendantsByClass<
    TTargetClass extends typeof BfNode<TTargetProps>,
    TTargetProps extends PropsBase = PropsBase,
  >(
    TargetClass: TTargetClass,
    limit: number = 10,
    cache?: BfNodeCache<TTargetProps>,
  ): Promise<Array<InstanceType<TTargetClass>>> {
    return this.queryDescendantsByClassName(TargetClass, limit, cache);
  }

  async querySourceInstances<
    TSourceClass extends typeof BfNode<TSourceProps>,
    TSourceProps extends PropsBase = PropsBase,
  >(
    SourceClass: TSourceClass,
    nodeProps: Partial<TSourceProps> = {},
    edgeProps: Partial<PropsBase> = {},
    cache?: BfNodeCache<TSourceProps>,
  ): Promise<Array<InstanceType<TSourceClass>>> {
    // Step 1: Query edges where this node is the target
    const { BfEdge } = await import("@bfmono/apps/bfDb/nodeTypes/BfEdge.ts");
    const edgeMetadata: Partial<BfEdgeMetadata> = {
      bfTid: this.metadata.bfGid,
      bfOid: this.cv.orgBfOid,
      bfSClassName: SourceClass.name,
    };

    const edges = await BfEdge.query(
      this.cv,
      edgeMetadata,
      edgeProps,
      [],
    );

    if (edges.length === 0) {
      return [];
    }

    // Step 2: Extract source IDs and query source nodes
    const sourceIds = edges.map((edge) =>
      (edge.metadata as BfEdgeMetadata).bfSid
    );

    const sourceMetadata: Partial<BfNodeMetadata> = {
      className: SourceClass.name,
      bfOid: this.cv.orgBfOid,
    };

    return SourceClass.query(
      this.cv,
      sourceMetadata,
      nodeProps,
      sourceIds,
      cache,
    );
  }

  async queryTargetInstances<
    TTargetClass extends typeof BfNode<TTargetProps>,
    TTargetProps extends PropsBase = PropsBase,
  >(
    TargetClass: TTargetClass,
    nodeProps: Partial<TTargetProps> = {},
    edgeProps: Partial<PropsBase> = {},
    cache?: BfNodeCache<TTargetProps>,
  ): Promise<
    Array<InstanceType<TTargetClass> & RelationshipMethods<TTargetClass>>
  > {
    // Step 1: Query edges where this node is the source
    const { BfEdge } = await import("@bfmono/apps/bfDb/nodeTypes/BfEdge.ts");
    const edgeMetadata: Partial<BfEdgeMetadata> = {
      bfSid: this.metadata.bfGid,
      bfOid: this.cv.orgBfOid,
      bfTClassName: TargetClass.name,
    };

    const edges = await BfEdge.query(
      this.cv,
      edgeMetadata,
      edgeProps,
      [],
    );

    if (edges.length === 0) {
      return [];
    }

    // Step 2: Extract target IDs and query target nodes
    const targetIds = edges.map((edge) =>
      (edge.metadata as BfEdgeMetadata).bfTid
    );

    const targetMetadata: Partial<BfNodeMetadata> = {
      className: TargetClass.name,
      bfOid: this.cv.orgBfOid,
    };

    return TargetClass.query(
      this.cv,
      targetMetadata,
      nodeProps,
      targetIds,
      cache,
    );
  }

  /**
   * Unlinks (deletes edges) between this node and specified target nodes
   * @param targetIds - Array of target node IDs to unlink
   * @param role - Optional role filter for the edges
   */
  async unlinkTargetInstances(
    targetIds: Array<BfGid>,
    role?: string,
  ): Promise<void> {
    const { BfEdge } = await import("@bfmono/apps/bfDb/nodeTypes/BfEdge.ts");

    for (const targetId of targetIds) {
      const edgeMetadata: Partial<BfEdgeMetadata> = {
        bfSid: this.metadata.bfGid,
        bfTid: targetId,
        bfOid: this.cv.orgBfOid,
      };

      const edgeProps: Partial<PropsBase> = {};
      if (role) {
        edgeProps.role = role;
      }

      const edges = await BfEdge.query(
        this.cv,
        edgeMetadata,
        edgeProps,
        [],
      );

      for (const edge of edges) {
        await edge.delete();
      }
    }
  }

  protected beforeCreate(): Promise<void> | void {}
  protected afterCreate(): Promise<void> | void {}
}
