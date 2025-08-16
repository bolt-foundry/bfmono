import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("V3 Simplified Eval System Routes", async (t) => {
  const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

  await t.step("should match /pg redirect route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/pg", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find /pg route");
  });

  await t.step("should match /pg/grade/decks", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/pg/grade/decks", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/decks");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find /pg/grade/decks route");
  });

  await t.step("should match deck samples route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/deck/sports-grader/samples",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/deck/:deckId/samples");
        assertEquals(match.params, { deckId: "sports-grader" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find deck samples route");
  });

  await t.step("should match sample view route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/sample/sample-001",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/sample/:sampleId");
        assertEquals(match.params, {
          sampleId: "sample-001",
        });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find sample view route");
  });

  await t.step("should match grading route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/deck/my-deck/grade",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/deck/:deckId/grade");
        assertEquals(match.params, { deckId: "my-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find grading route");
  });

  await t.step("should handle query parameters with V3 routes", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/deck/test-deck/samples?tab=results&mode=debug",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/deck/:deckId/samples");
        assertEquals(match.params, { deckId: "test-deck" });
        assertEquals(match.queryParams, { tab: "results", mode: "debug" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should handle query parameters");
  });

  await t.step("should prefer exact matches over parameterized matches", () => {
    // Test that /pg matches exactly, not as a parameter in another route
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/pg", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should match exact /pg route");
  });
});
