import { assertThrows } from "@std/assert";
import { useBfDsToast } from "@bfmono/apps/bfDs/contexts/BfDsToastContext.tsx";
import { render } from "@bfmono/infra/testing/ui-testing.ts";

// Test component that tries to use toast context without provider
function TestComponentWithoutProvider() {
  useBfDsToast();
  return <div>Should not render</div>;
}

Deno.test("useBfDsToast throws error when used outside provider", () => {
  assertThrows(
    () => {
      render(<TestComponentWithoutProvider />);
    },
    Error,
    "useBfDsToast must be used within a BfDsToastProvider",
  );
});
