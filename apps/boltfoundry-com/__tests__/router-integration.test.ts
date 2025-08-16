import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("Router Integration Test", async (t) => {
  await t.step("should match existing routes", () => {
    // Test existing exact routes
    const evalResult = matchRouteWithParams("/eval", "/eval");
    assertEquals(evalResult.match, true);
    assertEquals(evalResult.params, {});

    // Test existing wildcard routes
    const uiResult = matchRouteWithParams("/ui/demo", "/ui/*");
    assertEquals(uiResult.match, true);
    assertEquals(uiResult.params, {});
  });

  await t.step(
    "should find matching routes from actual route definitions",
    () => {
      const testPath = "/eval";
      const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

      let foundMatch = false;
      for (const routePattern of allRoutes) {
        const match = matchRouteWithParams(testPath, routePattern);
        if (match.match) {
          foundMatch = true;
          assertEquals(routePattern, "/eval");
          assertEquals(match.params, {});
          break;
        }
      }

      assertEquals(foundMatch, true, "Should find a matching route for /eval");
    },
  );

  await t.step("should handle non-matching routes correctly", () => {
    const testPath = "/nonexistent";
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(testPath, routePattern);
      if (match.match) {
        foundMatch = true;
        break;
      }
    }

    assertEquals(
      foundMatch,
      false,
      "Should not find a match for nonexistent route",
    );
  });

  await t.step("parameter extraction works with hypothetical routes", () => {
    // This tests our parameter extraction logic even though the route doesn't exist yet
    const result = matchRouteWithParams(
      "/eval/decks/test-deck",
      "/eval/decks/:deckId",
    );
    assertEquals(result.match, true);
    assertEquals(result.params, { deckId: "test-deck" });
  });
});
