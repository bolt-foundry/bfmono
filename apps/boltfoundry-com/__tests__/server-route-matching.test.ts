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
    assertEquals(shouldHandleWithReact("/eval"), true);
    assertEquals(shouldHandleWithReact("/login"), true);
  });

  await t.step("should handle parameterized eval routes", () => {
    assertEquals(shouldHandleWithReact("/eval/decks"), true);
    assertEquals(shouldHandleWithReact("/eval/decks/my-deck"), true);
    assertEquals(
      shouldHandleWithReact("/eval/decks/sports-grader/sample/sample-001"),
      true,
    );
    assertEquals(shouldHandleWithReact("/eval/decks/test-deck/grading"), true);
  });

  await t.step("should handle fullscreen routes", () => {
    assertEquals(shouldHandleWithReact("/deck/my-deck"), true);
    assertEquals(
      shouldHandleWithReact("/deck/sports-grader/sample/sample-001"),
      true,
    );
    assertEquals(shouldHandleWithReact("/deck/test-deck/grading"), true);
  });

  await t.step("should handle wildcard routes", () => {
    assertEquals(shouldHandleWithReact("/ui"), true);
    assertEquals(shouldHandleWithReact("/ui/demo"), true);
    assertEquals(shouldHandleWithReact("/ui/nested/path"), true);
  });

  await t.step("should reject unknown routes", () => {
    assertEquals(shouldHandleWithReact("/unknown"), false);
    assertEquals(shouldHandleWithReact("/api/something"), false);
    assertEquals(shouldHandleWithReact("/eval/invalid/structure"), false);
    assertEquals(shouldHandleWithReact("/deck"), false); // Missing required deckId
  });

  await t.step("should handle routes with query parameters", () => {
    assertEquals(
      shouldHandleWithReact("/eval/decks/test-deck?tab=results"),
      true,
    );
    assertEquals(shouldHandleWithReact("/deck/my-deck?mode=fullscreen"), true);
  });
});
