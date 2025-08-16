import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("V2 Eval System Routes", async (t) => {
  const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

  await t.step("should match /pg/grade", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/pg/grade", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find /pg/grade route");
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
        "/pg/grade/decks/sports-grader-v2/samples",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/decks/:deckId/samples");
        assertEquals(match.params, { deckId: "sports-grader-v2" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find deck samples route");
  });

  await t.step("should match sample view route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/decks/sports-grader/sample/sample-001",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/decks/:deckId/sample/:sampleId");
        assertEquals(match.params, {
          deckId: "sports-grader",
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
        "/pg/grade/decks/my-deck/samples/grading",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/decks/:deckId/samples/grading");
        assertEquals(match.params, { deckId: "my-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find grading route");
  });

  await t.step("should match fullscreen deck route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/deck/fullscreen-deck",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/deck/:deckId");
        assertEquals(match.params, { deckId: "fullscreen-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find fullscreen deck route");
  });

  await t.step("should match fullscreen sample route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/sample/test-sample",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/sample/:sampleId");
        assertEquals(match.params, {
          sampleId: "test-sample",
        });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find fullscreen sample route");
  });

  await t.step("should match fullscreen grading route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/deck/grading-deck/samples/grading",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/deck/:deckId/samples/grading");
        assertEquals(match.params, { deckId: "grading-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find fullscreen grading route");
  });

  await t.step("should handle query parameters with V2 routes", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/pg/grade/decks/test-deck/samples?tab=results&mode=debug",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/pg/grade/decks/:deckId/samples");
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
