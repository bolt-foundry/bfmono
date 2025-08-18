import { assertEquals } from "@std/assert";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("RouterContext Parameter Population", async (t) => {
  await t.step("should find and extract parameters from test route", () => {
    const testPath = "/test/route/abc123";
    const testRoutePattern = "/test/route/:testId";

    const match = matchRouteWithParams(testPath, testRoutePattern);

    assertEquals(match.match, true, "Should match the test route pattern");
    assertEquals(
      match.params,
      { testId: "abc123" },
      "Should extract testId parameter",
    );
  });

  await t.step("should handle the test route in RouterContext logic", () => {
    // Test generic route matching logic without requiring specific routes to exist
    const currentPath = "/generic/test/my-test-123";
    const testRoutePattern = "/generic/test/:testId";

    const match = matchRouteWithParams(currentPath, testRoutePattern);

    assertEquals(match.match, true, "Should match the generic test pattern");
    assertEquals(
      match.params,
      { testId: "my-test-123" },
      "Should extract testId parameter",
    );
    assertEquals(match.queryParams, {}, "Should have empty query params");
  });

  await t.step("should handle query parameters with test route", () => {
    const testPath = "/test/route/test-123?mode=debug&tab=results";
    const testRoutePattern = "/test/route/:testId";

    const match = matchRouteWithParams(testPath, testRoutePattern);

    assertEquals(match.match, true, "Should match pattern with query params");
    assertEquals(
      match.params,
      { testId: "test-123" },
      "Should extract testId parameter",
    );
    assertEquals(
      match.queryParams,
      { mode: "debug", tab: "results" },
      "Should extract query parameters",
    );
  });

  await t.step("should handle trailing slash correctly", () => {
    const testPathWithSlash = "/test/route/abc123/";
    const testPathWithoutSlash = "/test/route/abc123";
    const testRoutePattern = "/test/route/:testId";

    const matchWithSlash = matchRouteWithParams(
      testPathWithSlash,
      testRoutePattern,
    );
    const matchWithoutSlash = matchRouteWithParams(
      testPathWithoutSlash,
      testRoutePattern,
    );

    assertEquals(
      matchWithSlash.match,
      true,
      "Should match pattern with trailing slash",
    );
    assertEquals(
      matchWithSlash.params,
      { testId: "abc123" },
      "Should extract testId parameter from path with trailing slash",
    );

    assertEquals(
      matchWithoutSlash.match,
      true,
      "Should match pattern without trailing slash",
    );
    assertEquals(
      matchWithoutSlash.params,
      { testId: "abc123" },
      "Should extract testId parameter from path without trailing slash",
    );

    // Both should produce identical results
    assertEquals(
      matchWithSlash.params,
      matchWithoutSlash.params,
      "Trailing slash should not affect parameter extraction",
    );
  });
});
