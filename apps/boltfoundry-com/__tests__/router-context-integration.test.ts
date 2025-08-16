import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("RouterContext Parameter Population", async (t) => {
  await t.step("should find and extract parameters from test route", () => {
    const testPath = "/eval/test/abc123";
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

    let foundMatch = false;
    let extractedParams = {};

    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(testPath, routePattern);
      if (match.match) {
        foundMatch = true;
        extractedParams = match.params;
        assertEquals(routePattern, "/eval/test/:testId");
        assertEquals(match.params, { testId: "abc123" });
        break;
      }
    }

    assertEquals(foundMatch, true, "Should find the test route");
    assertEquals(
      extractedParams,
      { testId: "abc123" },
      "Should extract testId parameter",
    );
  });

  await t.step("should handle the test route in RouterContext logic", () => {
    // This simulates what happens in the RouterContext useEffect
    const currentPath = "/eval/test/my-test-123";
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

    let routeParams = {};
    let queryParams = {};

    // This is the exact logic from RouterProvider useEffect
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(currentPath, routePattern);
      if (match.match) {
        routeParams = match.params;
        queryParams = match.queryParams;
        break;
      }
    }

    assertEquals(routeParams, { testId: "my-test-123" });
    assertEquals(queryParams, {});
  });

  await t.step("should handle query parameters with test route", () => {
    const testPath = "/eval/test/test-123?mode=debug&tab=results";
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(testPath, routePattern);
      if (match.match && routePattern === "/eval/test/:testId") {
        assertEquals(match.params, { testId: "test-123" });
        assertEquals(match.queryParams, { mode: "debug", tab: "results" });
        break;
      }
    }
  });
});
