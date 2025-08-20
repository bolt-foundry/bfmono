import type * as React from "react";
import type { ExtractReadFromStore, FragmentReference } from "@isograph/react";
import { useResult } from "@isograph/react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { BfError } from "@bfmono/lib/BfError.ts";
import type { RouteEntrypoint } from "../__generated__/builtRoutes.ts";
import type { BfIsographEntrypoint } from "./BfIsographEntrypoint.ts";
import { handleClientRedirect, isRedirect } from "./redirectHandler.ts";

const _logger = getLogger(import.meta);

type NetworkRequestReaderOptions = {
  suspendIfInFlight: boolean;
  throwOnNetworkError: boolean;
};

export function BfIsographFragmentReader<
  TEntrypoint extends BfIsographEntrypoint,
>(
  props: {
    fragmentReference: FragmentReference<
      ExtractReadFromStore<TEntrypoint>,
      RouteEntrypoint
    >;
    networkRequestOptions?: Partial<NetworkRequestReaderOptions>;
    additionalProps?: Record<string, unknown>;
  },
): React.ReactNode {
  const result = useResult(
    props.fragmentReference,
    props.networkRequestOptions,
  );

  // Check if this is a redirect response
  if (isRedirect(result)) {
    // Handle client-side redirect
    handleClientRedirect(result.headers.Location);
    // Return null while redirecting
    return null;
  }

  const { Body } = result;

  if (!Body) {
    throw new BfError("Couldn't load a valid component");
  }

  return <Body {...props.additionalProps} />;
}
