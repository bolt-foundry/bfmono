import { iso } from "@iso-bfc";
import { EvalProvider } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";
import { Eval } from "@bfmono//internalbf/bfmono/apps/boltfoundry-com/components/mock/eval/Eval.tsx";

/**
 * EntrypointPgMock - Mock version of the PG interface using shared/eval components
 * Provides access to the old eval interface that was lost when implementing real data
 */
export const EntrypointPgMock = iso(`
  field Query.EntrypointPgMock {
    __typename
  }
`)(function EntrypointPgMock() {
  return {
    Body: () => (
      <EvalProvider>
        <Eval />
      </EvalProvider>
    ),
    title: "Mock PG - Bolt Foundry",
  };
});
