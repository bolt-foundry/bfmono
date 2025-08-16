import { assertEquals } from "@std/assert";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

// Simulate the server-side shouldHandleWithReact function
function shouldHandleWithReact(pathname: string): boolean {
  // Check exact matches first
  if (isographAppRoutes.has(pathname) || appRoutes.has(pathname)) {
    return true;
  }

  // Use the same parameter matching logic as client-side
  for (const [routePath] of [...isographAppRoutes, ...appRoutes]) {
    const match = matchRouteWithParams(pathname, routePath);
    if (match.match) {
      return true;
    }
  }

  return false;
}

Deno.test("Server-Side Route Matching", async (t) => {
  await t.step("should handle exact routes", () => {
    assertEquals(shouldHandleWithReact("/"), true);
    assertEquals(shouldHandleWithReact("/pg"), true);
    assertEquals(shouldHandleWithReact("/pg/grade"), true);
    assertEquals(shouldHandleWithReact("/login"), true);
  });

  await t.step("should handle parameterized V2 routes", () => {
    assertEquals(shouldHandleWithReact("/pg/grade/decks"), true);
    assertEquals(
      shouldHandleWithReact("/pg/grade/decks/my-deck/samples"),
      true,
    );
    assertEquals(
      shouldHandleWithReact("/pg/grade/decks/sports-grader/sample/sample-001"),
      true,
    );
    assertEquals(
      shouldHandleWithReact("/pg/grade/decks/test-deck/samples/grading"),
      true,
    );
  });

  await t.step("should handle fullscreen routes", () => {
    assertEquals(shouldHandleWithReact("/pg/grade/deck/my-deck"), true);
    assertEquals(
      shouldHandleWithReact("/pg/grade/sample/sample-001"),
      true,
    );
    assertEquals(
      shouldHandleWithReact("/pg/grade/deck/test-deck/samples/grading"),
      true,
    );
  });

  await t.step("should handle wildcard routes", () => {
    assertEquals(shouldHandleWithReact("/ui"), true);
    assertEquals(shouldHandleWithReact("/ui/demo"), true);
    assertEquals(shouldHandleWithReact("/ui/nested/path"), true);
  });

  await t.step("should reject unknown routes", () => {
    assertEquals(shouldHandleWithReact("/unknown"), false);
    assertEquals(shouldHandleWithReact("/api/something"), false);
    assertEquals(shouldHandleWithReact("/pg/invalid/structure"), false);
    assertEquals(shouldHandleWithReact("/pg/grade/deck"), false); // Missing required deckId
  });

  await t.step("should handle routes with query parameters", () => {
    assertEquals(
      shouldHandleWithReact("/pg/grade/decks/test-deck/samples?tab=results"),
      true,
    );
    assertEquals(
      shouldHandleWithReact("/pg/grade/deck/my-deck?mode=fullscreen"),
      true,
    );
  });
});
