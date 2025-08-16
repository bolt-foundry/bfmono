import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("Eval System Routes", async (t) => {
  const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

  await t.step("should match /eval/decks", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/eval/decks", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval/decks");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find /eval/decks route");
  });

  await t.step("should match deck overview route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/eval/decks/sports-grader-v2",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval/decks/:deckId");
        assertEquals(match.params, { deckId: "sports-grader-v2" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find deck overview route");
  });

  await t.step("should match sample view route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/eval/decks/sports-grader/sample/sample-001",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval/decks/:deckId/sample/:sampleId");
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
        "/eval/decks/my-deck/grading",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval/decks/:deckId/grading");
        assertEquals(match.params, { deckId: "my-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find grading route");
  });

  await t.step("should match fullscreen deck route", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/deck/fullscreen-deck", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/deck/:deckId");
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
        "/deck/test-deck/sample/test-sample",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/deck/:deckId/sample/:sampleId");
        assertEquals(match.params, {
          deckId: "test-deck",
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
        "/deck/grading-deck/grading",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/deck/:deckId/grading");
        assertEquals(match.params, { deckId: "grading-deck" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should find fullscreen grading route");
  });

  await t.step("should handle query parameters with eval routes", () => {
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(
        "/eval/decks/test-deck?tab=results&mode=debug",
        routePattern,
      );
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval/decks/:deckId");
        assertEquals(match.params, { deckId: "test-deck" });
        assertEquals(match.queryParams, { tab: "results", mode: "debug" });
        break;
      }
    }
    assertEquals(foundMatch, true, "Should handle query parameters");
  });

  await t.step("should prefer exact matches over parameterized matches", () => {
    // Test that /eval matches exactly, not as a parameter in another route
    let foundMatch = false;
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams("/eval", routePattern);
      if (match.match) {
        foundMatch = true;
        assertEquals(routePattern, "/eval");
        assertEquals(match.params, {});
        break;
      }
    }
    assertEquals(foundMatch, true, "Should match exact /eval route");
  });
});
