import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import {
  getLayoutMode,
  type LayoutMode,
  matchRouteWithParams,
  toggleLayoutMode,
} from "../contexts/RouterContext.tsx";

// Simulate the complete RouterContext workflow
function simulateRouterContext(pathname: string) {
  const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];

  // This is the exact logic from RouterProvider useEffect
  let routeParams = {};
  let queryParams = {};
  let foundMatch = false;

  for (const routePattern of allRoutes) {
    const match = matchRouteWithParams(pathname, routePattern);
    if (match.match) {
      routeParams = match.params;
      queryParams = match.queryParams;
      foundMatch = true;
      break;
    }
  }

  const layoutMode = getLayoutMode(pathname);

  return {
    currentPath: pathname,
    routeParams,
    queryParams,
    layoutMode,
    foundMatch,
    togglePath: toggleLayoutMode(pathname),
  };
}

Deno.test("Complete V2 Routing System Integration", async (t) => {
  await t.step("should handle V2 landing page", () => {
    const result = simulateRouterContext("/pg");

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, {});
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.togglePath, "/pg"); // No toggle for landing page
  });

  await t.step("should handle grade tool landing page", () => {
    const result = simulateRouterContext("/pg/grade");

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, {});
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.togglePath, "/pg/grade"); // No toggle for grade tool landing
  });

  await t.step("should handle decks list", () => {
    const result = simulateRouterContext("/pg/grade/decks");

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, {});
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.togglePath, "/pg/grade/decks"); // No toggle for decks list
  });

  await t.step("should handle deck samples with parameters", () => {
    const result = simulateRouterContext(
      "/pg/grade/decks/sports-grader-v2/samples",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "sports-grader-v2" });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.togglePath, "/pg/grade/deck/sports-grader-v2");
  });

  await t.step("should handle sample view with multiple parameters", () => {
    const result = simulateRouterContext(
      "/pg/grade/decks/sports-grader/sample/sample-001",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, {
      deckId: "sports-grader",
      sampleId: "sample-001",
    });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(
      result.togglePath,
      "/pg/grade/sample/sample-001",
    );
  });

  await t.step("should handle grading view", () => {
    const result = simulateRouterContext(
      "/pg/grade/decks/my-deck/samples/grading",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "my-deck" });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.togglePath, "/pg/grade/deck/my-deck/samples/grading");
  });

  await t.step("should handle fullscreen deck view", () => {
    const result = simulateRouterContext("/pg/grade/deck/sports-grader-v2");

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "sports-grader-v2" });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(result.togglePath, "/pg/grade/decks/sports-grader-v2/samples");
  });

  await t.step("should handle fullscreen sample view", () => {
    const result = simulateRouterContext("/pg/grade/sample/test-sample");

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, {
      sampleId: "test-sample",
    });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(result.togglePath, "/pg/grade/sample/test-sample"); // No toggle for direct sample view
  });

  await t.step("should handle fullscreen grading view", () => {
    const result = simulateRouterContext(
      "/pg/grade/deck/grading-deck/samples/grading",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "grading-deck" });
    assertEquals(result.queryParams, {});
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(
      result.togglePath,
      "/pg/grade/decks/grading-deck/samples/grading",
    );
  });

  await t.step("should handle query parameters correctly", () => {
    const result = simulateRouterContext(
      "/pg/grade/decks/test-deck/samples?tab=results&mode=debug&page=2",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "test-deck" });
    assertEquals(result.queryParams, {
      tab: "results",
      mode: "debug",
      page: "2",
    });
    assertEquals(result.layoutMode, "normal");
    assertEquals(
      result.togglePath,
      "/pg/grade/deck/test-deck?tab=results&mode=debug&page=2",
    );
  });

  await t.step("should handle fullscreen with query parameters", () => {
    const result = simulateRouterContext(
      "/pg/grade/deck/my-deck?view=compact&filter=active",
    );

    assertEquals(result.foundMatch, true);
    assertEquals(result.routeParams, { deckId: "my-deck" });
    assertEquals(result.queryParams, {
      view: "compact",
      filter: "active",
    });
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(
      result.togglePath,
      "/pg/grade/decks/my-deck/samples?view=compact&filter=active",
    );
  });

  await t.step("should handle backward compatibility routes", () => {
    // Test that existing routes still work
    const routes = [
      { path: "/", shouldMatch: true, layoutMode: "normal" as LayoutMode },
      { path: "/login", shouldMatch: true, layoutMode: "normal" as LayoutMode },
      { path: "/rlhf", shouldMatch: true, layoutMode: "normal" as LayoutMode },
      { path: "/ui", shouldMatch: true, layoutMode: "normal" as LayoutMode },
      {
        path: "/ui/demo",
        shouldMatch: true,
        layoutMode: "normal" as LayoutMode,
      },
      {
        path: "/plinko",
        shouldMatch: true,
        layoutMode: "normal" as LayoutMode,
      },
    ];

    for (const route of routes) {
      const result = simulateRouterContext(route.path);
      assertEquals(
        result.foundMatch,
        route.shouldMatch,
        `Route ${route.path} should ${
          route.shouldMatch ? "match" : "not match"
        }`,
      );
      assertEquals(
        result.layoutMode,
        route.layoutMode,
        `Route ${route.path} should have ${route.layoutMode} layout mode`,
      );
    }
  });
});

Deno.test("Layout Mode Workflow Integration", async (t) => {
  await t.step("should handle complete layout toggle workflow", () => {
    // Start in normal mode
    let result = simulateRouterContext("/pg/grade/decks/sports-grader/samples");
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.routeParams, { deckId: "sports-grader" });

    // Toggle to fullscreen
    const fullscreenPath = result.togglePath;
    result = simulateRouterContext(fullscreenPath);
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(result.routeParams, { deckId: "sports-grader" });
    assertEquals(result.currentPath, "/pg/grade/deck/sports-grader");

    // Toggle back to normal
    const normalPath = result.togglePath;
    result = simulateRouterContext(normalPath);
    assertEquals(result.layoutMode, "normal");
    assertEquals(result.routeParams, { deckId: "sports-grader" });
    assertEquals(result.currentPath, "/pg/grade/decks/sports-grader/samples");
  });

  await t.step("should preserve parameters during layout toggle", () => {
    // Complex route with multiple parameters and query params
    const originalPath =
      "/pg/grade/decks/complex-deck/sample/sample-123?tab=grading&mode=review";

    let result = simulateRouterContext(originalPath);
    assertEquals(result.routeParams, {
      deckId: "complex-deck",
      sampleId: "sample-123",
    });
    assertEquals(result.queryParams, {
      tab: "grading",
      mode: "review",
    });
    assertEquals(result.layoutMode, "normal");

    // Toggle to fullscreen - should preserve all parameters
    const fullscreenPath = result.togglePath;
    result = simulateRouterContext(fullscreenPath);
    assertEquals(result.routeParams, {
      sampleId: "sample-123",
    });
    assertEquals(result.queryParams, {
      tab: "grading",
      mode: "review",
    });
    assertEquals(result.layoutMode, "fullscreen");
    assertEquals(
      result.currentPath,
      "/pg/grade/sample/sample-123?tab=grading&mode=review",
    );
  });
});
