import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { BfErrorDb } from "@bfmono/apps/bfDb/classes/BfErrorDb.ts";
import type { BfGid } from "@bfmono/lib/types.ts";
import type {
  AnyBfNodeCtor,
  BfEdgeMetadata,
  BfNodeMetadata,
} from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type {
  Connection,
  ConnectionArguments,
  Edge,
  PageInfo,
} from "graphql-relay";
import type { BfDbMetadata } from "@bfmono/apps/bfDb/backend/DatabaseBackend.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";

const logger = getLogger(import.meta);

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | Array<JSONValue>;

export type Props = Record<string, JSONValue>;

export type DbItem<T extends Props> = {
  props: T;
  metadata: BfDbMetadata;
};

// Function to convert sortValue to base64 cursor
export function sortValueToCursor(sortValue: number = Date.now()): string {
  // Convert number to string and then Uint8Array
  const uint8Array = new TextEncoder().encode(sortValue.toString());
  // Convert Uint8Array to base64
  return btoa(String.fromCharCode(...uint8Array));
}

// Function to convert base64 cursor back to sortValue
function cursorToSortValue(cursor: string): number {
  // Convert base64 to string
  const decodedString = atob(cursor);
  // Convert string to Uint8Array
  const uint8Array = new Uint8Array(
    [...decodedString].map((char) => char.charCodeAt(0)),
  );
  // Decode Uint8Array to original string and convert to number
  return parseInt(new TextDecoder().decode(uint8Array), 10);
}

export async function bfGetItem<
  TProps extends Props,
>(bfOid: BfGid, bfGid: BfGid): Promise<DbItem<TProps> | null> {
  logger.trace("getItem", bfOid, bfGid);
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  return await storage.get<TProps>(bfOid, bfGid);
}

export async function bfGetItemByBfGid<
  TProps extends Props = Props,
>(
  bfGid: BfGid,
  nodeClassOrClassName?: AnyBfNodeCtor | string,
): Promise<DbItem<TProps> | null> {
  logger.trace("getItemByBfGid", { bfGid, nodeClassOrClassName });
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");

  // Convert string className to undefined since storage.getByBfGid expects AnyBfNodeCtor
  const nodeClass = typeof nodeClassOrClassName === "string"
    ? undefined
    : nodeClassOrClassName;
  return await storage.getByBfGid<TProps>(bfGid, nodeClass);
}

export async function bfGetItemsByBfGid<
  TProps extends Props = Props,
>(
  bfGids: Array<BfGid>,
  nodeClassOrClassName?: AnyBfNodeCtor | string,
): Promise<Array<DbItem<TProps>>> {
  logger.trace("getItemsByBfGid", { bfGids, nodeClassOrClassName });
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  return await storage.getByBfGids<TProps>(bfGids, nodeClassOrClassName);
}

export async function bfPutItem<
  TProps extends Props = Props,
>(
  itemProps: TProps,
  itemMetadata: BfNodeMetadata | BfEdgeMetadata,
): Promise<void> {
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  await storage.put<TProps, BfNodeMetadata | BfEdgeMetadata>(
    itemProps,
    itemMetadata,
  );
}

export async function bfDeleteItem(
  bfOid: BfGid,
  bfGid: BfGid,
): Promise<void> {
  logger.trace("deleteItem", bfOid, bfGid);
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  await storage.delete(bfOid, bfGid);
}

export async function bfQueryAncestorsByClassName<
  TProps extends Props,
>(
  bfOid: BfGid,
  targetBfGid: BfGid,
  sourceBfClassName: string,
  depth: number = 10,
): Promise<Array<DbItem<TProps>>> {
  try {
    const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
    return await storage.queryAncestorsByClassName<TProps>(
      bfOid,
      targetBfGid,
      sourceBfClassName,
      depth,
    );
  } catch (error) {
    logger.error("Error finding ancestors by class name:", error);
    throw error;
  }
}

export async function bfQueryDescendantsByClassName<
  TProps extends Props = Props,
>(
  bfOid: BfGid,
  sourceBfGid: BfGid,
  targetBfClassName: string,
  depth: number = 10,
): Promise<Array<DbItem<TProps>>> {
  try {
    const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
    return await storage.queryDescendantsByClassName<TProps>(
      bfOid,
      sourceBfGid,
      targetBfClassName,
      depth,
    );
  } catch (error) {
    logger.error("Error finding descendants by class name:", error);
    throw error;
  }
}

export async function bfQueryItemsUnified<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfDbMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  options: {
    useSizeLimit?: boolean;
    cursorValue?: number | string;
    maxSizeBytes?: number;
    batchSize?: number;
    totalLimit?: number;
    countOnly?: boolean;
  } = {},
): Promise<Array<DbItem<TProps>>> {
  const {
    useSizeLimit = false,
    cursorValue,
    maxSizeBytes = 10 * 1024 * 1024, // 10MB in bytes
    batchSize = 4,
    totalLimit,
    countOnly = false,
  } = options;

  // More detailed debugging for input parameters
  logger.debug({
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
    useSizeLimit,
    cursorValue,
    maxSizeBytes,
    batchSize,
  });

  // Debug the structure of metadataToQuery to find potential issues
  logger.debug(
    `metadataToQuery keys: ${Object.keys(metadataToQuery).join(", ")}`,
  );
  if ("props" in metadataToQuery) {
    logger.debug(
      `Found 'props' in metadataToQuery, this might cause issues. Props value: ${
        JSON.stringify(metadataToQuery.props)
      }`,
    );
  }

  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  logger.debug("Using storage facade for queryItemsUnified");

  if (useSizeLimit) {
    logger.debug(
      `Using size limit query with maxSizeBytes: ${maxSizeBytes}, batchSize: ${batchSize}`,
    );
    const results = await storage.queryWithSizeLimit<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      cursorValue,
      maxSizeBytes,
      batchSize,
    );
    logger.debug(`Size-limited query returned ${results.length} results`);
    return results;
  }

  // For count only or other special cases, we'll need more implementation
  // This is simplified for now
  if (countOnly) {
    const items = await storage.query<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return Array.from(
      { length: items.length },
      () => ({} as DbItem<TProps>),
    );
  }

  if (totalLimit) {
    // This would need more implementation to match the original behavior
    // For now, we'll just fetch and slice
    const items = await storage.query<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return items.slice(0, totalLimit);
  }

  const results = await storage.query<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );

  logger.debug(`Standard query returned ${results.length} results`);
  if (results.length === 0) {
    logger.debug("No results found. Query parameters:");
    logger.debug("metadataToQuery:", metadataToQuery);
    logger.debug("propsToQuery:", propsToQuery);
    logger.debug("bfGids:", bfGids || "undefined");
  } else {
    logger.debug("First result metadata:", results[0].metadata);
  }

  return results;
}

export async function bfQueryItems<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<Array<DbItem<TProps>>> {
  logger.debug({
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  });

  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  logger.debug("Using storage facade for bfQueryItems");

  const results = await storage.query<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );

  logger.debug(`Query results count: ${results.length}`);
  if (results.length > 0) {
    logger.debug("First result metadata:", results[0].metadata);
    logger.debug("First result props:", results[0].props);
  } else {
    logger.debug(`No results found for query`);
  }

  return results;
}

export async function bfQueryItemsWithSizeLimit<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  cursorValue?: number | string,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB in bytes
  batchSize: number = 4,
): Promise<Array<DbItem<TProps>>> {
  try {
    const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
    return await storage.queryWithSizeLimit<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
      cursorValue,
      maxSizeBytes,
      batchSize,
    );
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItemsTop<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  topCount = 20,
): Promise<Array<DbItem<TProps>>> {
  try {
    const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
    const items = await storage.query<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGids,
      orderDirection,
      orderBy,
    );
    return items.slice(0, topCount);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItem<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGid?: BfGid,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<DbItem<TProps> | null> {
  try {
    const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
    const items = await storage.query<TProps>(
      metadataToQuery,
      propsToQuery,
      bfGid ? [bfGid] : undefined,
      orderDirection,
      orderBy,
    );
    return items[0] ?? null;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export async function bfQueryItemsStream<TProps extends Props = Props>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
): Promise<ReadableStream<DbItem<TProps>>> {
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  const items = await storage.query<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
  );

  return new ReadableStream<DbItem<TProps>>({
    start(controller) {
      for (const item of items) {
        controller.enqueue(item);
      }
      controller.close();
    },
  });
}

export async function bfQueryItemsStreamWithSizeLimit<
  TProps extends Props = Props,
>(
  metadataToQuery: Partial<BfNodeMetadata | BfEdgeMetadata>,
  propsToQuery: Partial<TProps> = {},
  bfGids?: Array<BfGid>,
  orderDirection: "ASC" | "DESC" = "ASC",
  orderBy: string = "sort_value",
  cursorValue?: number | string,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB in bytes
  batchSize = 4,
): Promise<ReadableStream<DbItem<TProps>>> {
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  const items = await storage.queryWithSizeLimit<TProps>(
    metadataToQuery,
    propsToQuery,
    bfGids,
    orderDirection,
    orderBy,
    cursorValue,
    maxSizeBytes,
    batchSize,
  );

  return new ReadableStream<DbItem<TProps>>({
    start(controller) {
      for (const item of items) {
        controller.enqueue(item);
      }
      controller.close();
    },
  });
}

export async function bfQueryItemsForGraphQLConnection<
  TProps extends Props = Props,
  TMetadata extends BfDbMetadata = BfDbMetadata,
>(
  metadata: Partial<TMetadata>,
  props: Partial<TProps> = {},
  connectionArgs: ConnectionArguments,
  bfGids: Array<BfGid>,
): Promise<Connection<DbItem<TProps>> & { count: number }> {
  logger.debug({ metadata, props, connectionArgs });
  const { first, last, after, before } = connectionArgs;

  let orderDirection: "ASC" | "DESC" = "ASC";
  let cursorValue: number | undefined;
  let limit: number = 10;

  if (first != undefined) {
    orderDirection = "ASC";
    limit = first + 1; // Fetch one extra for next page check
    if (after) {
      cursorValue = cursorToSortValue(after);
    }
  } else if (last != undefined) {
    orderDirection = "DESC";
    limit = last + 1; // Fetch one extra for previous page check
    if (before) {
      cursorValue = cursorToSortValue(before);
    }
  }

  const results = await bfQueryItemsUnified(
    metadata,
    props,
    bfGids,
    orderDirection,
    "sort_value",
    {
      useSizeLimit: false,
      cursorValue,
      batchSize: 4,
      totalLimit: limit,
    },
  );

  const edges: Array<Edge<DbItem<TProps>>> = results.map((
    item,
  ) => ({
    cursor: sortValueToCursor(item.metadata.sortValue),
    node: item as DbItem<TProps>,
  }));

  let hasNextPage = false;
  let hasPreviousPage = false;

  if (first != undefined && edges.length > first) {
    hasNextPage = true;
    edges.pop(); // Remove the extra item
  } else if (last != undefined && edges.length > last) {
    hasPreviousPage = true;
    edges.shift(); // Remove the extra item from the beginning
  }

  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  const pageInfo = {
    startCursor,
    endCursor,
    hasNextPage,
    hasPreviousPage,
  } as PageInfo;

  // Count the total number of items
  const countItems = await bfQueryItems(
    metadata,
    props,
    bfGids,
  );
  const count = countItems.length;

  return {
    edges,
    pageInfo,
    count,
  };
}

export async function CLEAR_FOR_DEBUGGING() {
  try {
    const { getConfigurationVariable } = await import(
      "@bolt-foundry/get-configuration-var"
    );
    const { neon } = await import("@neondatabase/serverless");

    if (getConfigurationVariable("BF_ENV") === "DEVELOPMENT") {
      const databaseUrl = getConfigurationVariable("DATABASE_URL");
      if (!databaseUrl) {
        throw new BfErrorDb("DATABASE_URL is not set");
      }
      const sql = neon(databaseUrl);

      await sql`
      WITH class_names AS (
        SELECT unnest(ARRAY['BfJob', 'BfJobLarge', 'BfMedia', 'BfCollection', 'BfMediaNode', 'BfMediaNodeVideoGoogleDriveResource', 'BfMediaNodeTranscript', 'BfMediaNodeVideo', 'BfGoogleDriveResource', 'BfMediaSequence']) AS name
      )
      DELETE FROM bfdb
      WHERE class_name IN (SELECT name FROM class_names)
         OR bf_s_class_name IN (SELECT name FROM class_names)
         OR bf_t_class_name IN (SELECT name FROM class_names);
      `;
    }
  } catch (error) {
    logger.error("Error in CLEAR_FOR_DEBUGGING:", error);
    throw error;
  }
}

/**
 * Closes the database connection
 * Primarily used in tests to prevent connection leaks
 */
export async function bfCloseConnection(): Promise<void> {
  logger.debug("Closing database connection");
  const { storage } = await import("@bfmono/apps/bfDb/storage/storage.ts");
  await storage.close();
}

// This function ensures database operations are properly isolated,
// especially useful for testing scenarios
export async function withIsolatedDb<T>(
  operation: () => Promise<T>,
  options: {
    forceBackendType?: string;
    customDbPath?: string;
  } = {},
): Promise<T> {
  // Store original environment values
  const originalDbPath = getConfigurationVariable("SQLITE_DB_PATH");
  const originalBackend = getConfigurationVariable("FORCE_DB_BACKEND");

  try {
    // Set temporary environment values if provided
    if (options.customDbPath) {
      Deno.env.set("SQLITE_DB_PATH", options.customDbPath);
    }

    if (options.forceBackendType) {
      Deno.env.set("FORCE_DB_BACKEND", options.forceBackendType);
    }

    // Make sure any existing connection is closed
    await bfCloseConnection();

    // Clear adapter registry to force re-registration with new settings
    const { AdapterRegistry } = await import("./storage/AdapterRegistry.ts");
    const { resetRegistration, registerDefaultAdapter } = await import(
      "./storage/registerDefaultAdapter.ts"
    );
    AdapterRegistry.clear();
    resetRegistration();

    // Register the adapter after setting environment variables
    // so that registerDefaultAdapter picks up the new backend type
    registerDefaultAdapter();

    // Additional safety: ensure the adapter is properly initialized
    const adapter = await AdapterRegistry.get();
    await adapter.initialize();
    logger.debug(`Initialized adapter: ${adapter.constructor.name}`);

    // For tests, prefer using SQLite as the default backend
    // if not explicitly specified otherwise
    if (
      !options.forceBackendType && !getConfigurationVariable("FORCE_DB_BACKEND")
    ) {
      logger.debug("Using SQLite for test isolation by default");
      Deno.env.set("FORCE_DB_BACKEND", "sqlite");

      // Generate a unique SQLite path for this test if not provided
      if (!options.customDbPath) {
        const uniqueDbPath = `tmp/test-db-test-${Date.now()}-${
          Math.floor(Math.random() * 1000)
        }.sqlite`;
        logger.debug(`Using unique SQLite database: ${uniqueDbPath}`);
        Deno.env.set("SQLITE_DB_PATH", uniqueDbPath);
      }
    }

    // Run the operation with fresh connection
    return await operation();
  } finally {
    // Ensure connection is properly closed
    try {
      logger.debug("Closing database connection after isolated operation");
      await bfCloseConnection();
    } catch (error) {
      logger.error("Error closing connection in withIsolatedDb:", error);
    }

    // Restore original environment values
    if (options.customDbPath || !originalDbPath) {
      if (originalDbPath) {
        Deno.env.set("SQLITE_DB_PATH", originalDbPath);
      } else {
        Deno.env.delete("SQLITE_DB_PATH");
      }
    }

    if (options.forceBackendType || !originalBackend) {
      if (originalBackend) {
        Deno.env.set("FORCE_DB_BACKEND", originalBackend);
      } else {
        Deno.env.delete("FORCE_DB_BACKEND");
      }
    }

    // If using a custom SQLite path, try to clean up the file
    const dbPath = options.customDbPath ||
      (!options.forceBackendType
        ? getConfigurationVariable("SQLITE_DB_PATH")
        : null);

    if (
      dbPath &&
      (!options.forceBackendType || options.forceBackendType === "sqlite")
    ) {
      try {
        // Close any remaining connections before attempting to remove
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          await Deno.remove(dbPath);
          logger.debug(`Removed temporary SQLite database: ${dbPath}`);
        } catch (_e) {
          // Also try to remove the -shm and -wal files
          try {
            await Deno.remove(`${dbPath}-shm`);
          } catch { /* ignore */ }
          try {
            await Deno.remove(`${dbPath}-wal`);
          } catch { /* ignore */ }
        }
      } catch (error) {
        // Ignore errors if file doesn't exist or can't be removed
        logger.debug(
          `Could not remove SQLite database files: ${(error as Error).message}`,
        );
      }
    }
  }
}
