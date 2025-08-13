import type { IsographEntrypoint, NormalizationAst } from "@isograph/react";
// import type { RouteEntrypoint } from "@bfmono/apps/boltFoundry/__generated__/builtRoutes.ts"; // boltFoundry deleted

/**
 * A simplified version of IsographEntrypoint that only requires one type parameter
 * and defaults the others to appropriate values.
 *
 * @type T - The generic type for the entrypoint data structure
 */
// deno-lint-ignore no-explicit-any
export type BfIsographEntrypoint<T = any> = IsographEntrypoint<
  // deno-lint-ignore no-explicit-any
  any,
  T,
  NormalizationAst
>;
