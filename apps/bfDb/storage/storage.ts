// ---------------------------------------------------------------------------
// Unified storage façade that delegates **all** operations to the active
// backend adapter retrieved from `AdapterRegistry`.  A default adapter is
// auto‑registered (via `registerDefaultAdapter`) if nothing is present.
// ---------------------------------------------------------------------------

import { AdapterRegistry } from "./AdapterRegistry.ts";
import { registerDefaultAdapter } from "./registerDefaultAdapter.ts";

import type { BfGid } from "@bfmono/lib/types.ts";
import type { DbItem, Props } from "@bfmono/apps/bfDb/bfDb.ts";
import type {
  AnyBfNodeCtor,
  BfEdgeMetadata,
  BfNodeMetadata,
} from "@bfmono/apps/bfDb/classes/BfNode.ts";

/**
 * Ensures an adapter is available and returns it.
 * `registerDefaultAdapter()` is idempotent and fast, so calling on every
 * access keeps the API simple while retaining testability.
 */
async function adapter() {
  registerDefaultAdapter();
  return await AdapterRegistry.get();
}

export const storage = {
  // ---- lifecycle -------------------------------------------------------
  async initialize() {
    return (await adapter()).initialize();
  },

  async close() {
    return (await adapter()).close();
  },

  // ---- CRUD ------------------------------------------------------------
  async get<T extends Props>(bfOid: BfGid, bfGid: BfGid) {
    return (await adapter()).getItem<T>(bfOid, bfGid);
  },

  async getByBfGid<T extends Props>(
    bfGid: BfGid,
    nodeClass?: AnyBfNodeCtor,
  ): Promise<DbItem<T> | null> {
    const className = nodeClass?.name;
    return (await adapter()).getItemByBfGid<T>(bfGid, className);
  },

  async getByBfGids<T extends Props>(
    bfGids: Array<BfGid>,
    nodeClassOrClassName?: AnyBfNodeCtor | string,
  ) {
    const className = typeof nodeClassOrClassName === "string"
      ? nodeClassOrClassName
      : nodeClassOrClassName?.name;
    return (await adapter()).getItemsByBfGid<T>(bfGids.map(String), className);
  },

  async put<T extends Props, M extends BfNodeMetadata | BfEdgeMetadata>(
    props: T,
    metadata: M,
  ) {
    await (await adapter()).putItem<T>(props, metadata);
  },

  async query<T extends Props>(
    metadata: Record<string, unknown>,
    props: Partial<T> = {},
    bfGids?: Array<BfGid>,
    order: "ASC" | "DESC" = "ASC",
    orderBy?: string,
    // legacy `options` arg retained for backward‑compat but ignored here
    _options: Record<string, unknown> = {},
  ): Promise<Array<DbItem<T>>> {
    // Current DatabaseBackend interface ignores order/orderBy; we pass them so
    // the signature is future‑proof once those params are respected.
    return (await adapter()).queryItems<T>(
      metadata,
      props,
      bfGids?.map(String),
      order,
      orderBy,
    );
  },

  async queryWithSizeLimit<T extends Props>(
    metadata: Record<string, unknown>,
    props: Partial<T> = {},
    bfGids?: Array<string>,
    order: "ASC" | "DESC" = "ASC",
    orderBy?: string,
    cursorValue?: number | string,
    maxSizeBytes?: number,
    batchSize?: number,
  ): Promise<Array<DbItem<T>>> {
    return (await adapter()).queryItemsWithSizeLimit<T>(
      metadata,
      props,
      bfGids,
      order,
      orderBy,
      cursorValue,
      maxSizeBytes,
      batchSize,
    );
  },

  async delete(bfOid: BfGid, bfGid: BfGid) {
    await (await adapter()).deleteItem(bfOid, bfGid);
  },

  // ---- Graph traversal -------------------------------------------------
  async queryAncestorsByClassName<T extends Props>(
    bfOid: string,
    targetBfGid: string,
    sourceBfClassName: string,
    depth: number = 10,
  ): Promise<Array<DbItem<T>>> {
    return (await adapter()).queryAncestorsByClassName<T>(
      bfOid,
      targetBfGid,
      sourceBfClassName,
      depth,
    );
  },

  async queryDescendantsByClassName<T extends Props>(
    bfOid: string,
    sourceBfGid: string,
    targetBfClassName: string,
    depth: number = 10,
  ): Promise<Array<DbItem<T>>> {
    return (await adapter()).queryDescendantsByClassName<T>(
      bfOid,
      sourceBfGid,
      targetBfClassName,
      depth,
    );
  },
} as const;
