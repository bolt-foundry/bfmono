import type { IsographEntrypoint, NormalizationAst } from "@isograph/react";
import type { RouteEntrypoint } from "@bfmono/apps/boltfoundry-com/__generated__/builtRoutes.ts";

/**
 * A simplified version of IsographEntrypoint that only requires one type parameter
 * and defaults the others to appropriate values.
 *
 * @type T - The generic type for the entrypoint data structure
 */
export type BfIsographEntrypoint<T = RouteEntrypoint> = IsographEntrypoint<
  // deno-lint-ignore no-explicit-any
  any,
  T,
  NormalizationAst
>;
