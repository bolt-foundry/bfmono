import { getLogger } from "@bfmono/packages/logger/logger.ts";
import {
  CurrentViewer,
  type CurrentViewerLoggedIn,
  type CurrentViewerTypenames,
} from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import type { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { setLoginSuccessHeaders } from "@bfmono/apps/bfDb/graphql/utils/graphqlContextUtils.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

// import { setLoginSuccessHeaders } from "apps/bfDb/graphql/utils/graphqlContextUtils.ts";

const logger = getLogger(import.meta);

export type BfGraphqlContext = {
  [Symbol.dispose]: () => void;
  getCvForGraphql(): {
    __typename: CurrentViewerTypenames;
    id: string;
  };
  getCurrentViewer(): CurrentViewer;
  loginWithGoogleToken(idToken: string): Promise<CurrentViewerLoggedIn>;
  /**
   * Loads nodes by their GIDs and className
   * Used primarily for resolving edge relationships
   */
  loadNodesByGids(
    className: string,
    gids: Array<BfGid>,
  ): Promise<Array<BfNode> | null>;
  /**
   * Find a node by its GID
   */
  findNode<T extends BfNode = BfNode>(
    className: string,
    gid: BfGid,
  ): Promise<T | null>;
  //   createTargetNode<
  //     TProps extends BfNodeBaseProps,
  //     TBfClass extends typeof BfNode<TProps>,
  //   >(
  //     sourceNode: BfNode,
  //     BfClass: TBfClass,
  //     props: TProps,
  //     metadata?: BfNodeMetadata,
  //   ): Promise<InstanceType<TBfClass>>;
  //   find<
  //     TProps extends BfNodeBaseProps,
  //     TClass extends typeof BfNodeBase<TProps>,
  //   >(
  //     BfClass: TClass,
  //     id: BfGid | string | null | undefined,
  //   ): Promise<InstanceType<TClass> | null>;
  //   findX<
  //     TProps extends BfNodeBaseProps,
  //     TClass extends typeof BfNodeBase<TProps>,
  //   >(
  //     BfClass: TClass,
  //     id: BfGid,
  //   ): Promise<InstanceType<TClass>>;
  getRequestHeader(name: string): string | null;
  getResponseHeaders(): Headers;
};

export async function createContext(
  request: Request,
): Promise<BfGraphqlContext> {
  logger.debug("Creating new context");
  const cache = new Map<string, Map<BfGid, BfNode>>();
  const responseHeaders = new Headers();
  let currentViewer = await CurrentViewer.createFromRequest(
    import.meta,
    request,
    responseHeaders,
  );
  logger.info("Current viewer created", {
    viewerType: currentViewer.constructor.name,
    personGid: currentViewer.personBfGid,
    orgOid: currentViewer.orgBfOid,
  });

  const ctx: BfGraphqlContext = {
    [Symbol.dispose]() {
      logger.debug("Starting context disposal");
      cache.clear();
      logger.debug("Cache cleared");
      logger.debug("Context disposed successfully");
    },

    getResponseHeaders() {
      return new Headers(responseHeaders);
    },

    getRequestHeader(name: string) {
      return request.headers.get(name);
    },

    getCvForGraphql() {
      return currentViewer.toGraphql();
    },

    getCurrentViewer() {
      return currentViewer;
    },

    async loginWithGoogleToken(idToken) {
      logger.debug("Login with Google token attempt");
      const viewer = await CurrentViewer.loginWithGoogleToken(idToken);
      // issue cookies
      await setLoginSuccessHeaders(
        responseHeaders,
        viewer.personBfGid,
        viewer.orgBfOid,
        parseInt(viewer.id, 10) || 1,
      );
      currentViewer = viewer; // swap in new viewer for rest of request
      logger.debug("Google login successful");
      return viewer;
    },

    async loadNodesByGids(className, gids) {
      logger.debug(`Loading nodes by GIDs: ${className} [${gids.join(", ")}]`);

      if (!gids.length) {
        logger.debug(`No GIDs provided for ${className}, returning null`);
        return null;
      }

      try {
        // Find the class constructor by name
        // This is a simplified approach - in a real implementation,
        // you would have a registry of classes
        logger.debug(`Importing class ${className} dynamically`);
        const BfClass = await import(`../nodeTypes/${className}.ts`).then(
          (module) => module[className],
        );

        if (!BfClass) {
          logger.error(`Class ${className} not found`);
          return null;
        }

        // Check if we have a cache for this class
        let classCache = cache.get(className);
        if (!classCache) {
          logger.debug(`Creating new cache for ${className}`);
          classCache = new Map();
          cache.set(className, classCache);
        } else {
          logger.debug(`Using existing cache for ${className}`);
        }

        // Query for the nodes with the given GIDs
        logger.debug(`Querying for ${gids.length} nodes of type ${className}`);
        const nodes = await BfClass.query(
          currentViewer,
          { className },
          {},
          gids,
          classCache,
        );

        logger.debug(`Found ${nodes?.length || 0} nodes of type ${className}`);

        if (!nodes || nodes.length === 0) {
          return null;
        }

        return nodes;
      } catch (error) {
        logger.error(`Error loading nodes by GIDs: ${error}`);
        return null;
      }
    },

    async findNode<T extends BfNode = BfNode>(className: string, gid: BfGid) {
      logger.debug(`Finding node: ${className}:${gid}`);
      const nodes = await this.loadNodesByGids(className, [gid]);

      if (!nodes || nodes.length === 0) {
        logger.debug(`Node not found: ${className}:${gid}`);
        return null;
      }

      logger.debug(`Node found: ${className}:${gid}`);
      // deno-lint-ignore no-explicit-any
      return nodes[0] as any as T;
    },
    // async createTargetNode<
    //   TProps extends BfNodeBaseProps = BfNodeBaseProps,
    //   TBfClass extends typeof BfNode<TProps> = typeof BfNode<TProps>,
    // >(
    //   sourceNode: BfNode,
    //   TargetBfClass: TBfClass,
    //   props: TProps,
    //   metadata?: BfNodeMetadata,
    // ) {
    //   let innerCache = cache.get(TargetBfClass.name);
    //   if (!innerCache) {
    //     innerCache = new Map<BfGid, BfNodeBase>();
    //     cache.set(TargetBfClass.name, innerCache);
    //   }

    //   const newItem = await sourceNode.createTargetNode(
    //     TargetBfClass,
    //     props,
    //     metadata,
    //   );
    //   return newItem as InstanceType<TBfClass>;
    // },

    //   async find(BfClass, idOrString) {
    //     if (idOrString == null) {
    //       return null;
    //     }
    //     const id = idOrString as BfGid;
    //     const item = await BfClass.find(
    //       currentViewer,
    //       id,
    //       cache.get(BfClass.name),
    //     );
    //     return item as InstanceType<typeof BfClass>;
    //   },

    //   async findX(BfClass, id) {
    //     const item = await BfClass.findX(
    //       currentViewer,
    //       id,
    //       cache.get(BfClass.name),
    //     );
    //     return item as InstanceType<typeof BfClass>;
    //   },
  };

  return ctx;
}

// Type alias for compatibility with generated Nexus types
export type Context = BfGraphqlContext;
