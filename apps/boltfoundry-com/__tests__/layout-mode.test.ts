import { assertEquals } from "@std/assert";
import { getLayoutMode, toggleLayoutMode } from "../contexts/RouterContext.tsx";

Deno.test("Layout Mode Detection", async (t) => {
  await t.step("should detect normal mode for /eval routes", () => {
    assertEquals(getLayoutMode("/eval"), "normal");
    assertEquals(getLayoutMode("/eval/decks"), "normal");
    assertEquals(getLayoutMode("/eval/decks/sports-grader"), "normal");
    assertEquals(
      getLayoutMode("/eval/decks/test-deck/sample/sample-001"),
      "normal",
    );
    assertEquals(getLayoutMode("/eval/decks/my-deck/grading"), "normal");
  });

  await t.step("should detect fullscreen mode for /deck routes", () => {
    assertEquals(getLayoutMode("/deck/sports-grader"), "fullscreen");
    assertEquals(
      getLayoutMode("/deck/test-deck/sample/sample-001"),
      "fullscreen",
    );
    assertEquals(getLayoutMode("/deck/my-deck/grading"), "fullscreen");
  });

  await t.step("should detect normal mode for other routes", () => {
    assertEquals(getLayoutMode("/"), "normal");
    assertEquals(getLayoutMode("/login"), "normal");
    assertEquals(getLayoutMode("/rlhf"), "normal");
    assertEquals(getLayoutMode("/ui"), "normal");
    assertEquals(getLayoutMode("/ui/demo"), "normal");
  });
});

Deno.test("Layout Mode Toggling", async (t) => {
  await t.step("should toggle from normal to fullscreen", () => {
    assertEquals(
      toggleLayoutMode("/eval/decks/sports-grader"),
      "/deck/sports-grader",
    );
    assertEquals(
      toggleLayoutMode("/eval/decks/test-deck/sample/sample-001"),
      "/deck/test-deck/sample/sample-001",
    );
    assertEquals(
      toggleLayoutMode("/eval/decks/my-deck/grading"),
      "/deck/my-deck/grading",
    );
  });

  await t.step("should toggle from fullscreen to normal", () => {
    assertEquals(
      toggleLayoutMode("/deck/sports-grader"),
      "/eval/decks/sports-grader",
    );
    assertEquals(
      toggleLayoutMode("/deck/test-deck/sample/sample-001"),
      "/eval/decks/test-deck/sample/sample-001",
    );
    assertEquals(
      toggleLayoutMode("/deck/my-deck/grading"),
      "/eval/decks/my-deck/grading",
    );
  });

  await t.step("should preserve query parameters", () => {
    assertEquals(
      toggleLayoutMode("/eval/decks/test-deck?tab=results&mode=debug"),
      "/deck/test-deck?tab=results&mode=debug",
    );
    assertEquals(
      toggleLayoutMode("/deck/my-deck?view=compact"),
      "/eval/decks/my-deck?view=compact",
    );
  });

  await t.step("should handle non-toggleable routes", () => {
    // Routes that don't have a toggle equivalent should remain unchanged
    assertEquals(toggleLayoutMode("/eval"), "/eval");
    assertEquals(toggleLayoutMode("/eval/decks"), "/eval/decks");
    assertEquals(toggleLayoutMode("/login"), "/login");
    assertEquals(toggleLayoutMode("/ui"), "/ui");
  });

  await t.step("should handle complex deck IDs", () => {
    assertEquals(
      toggleLayoutMode("/eval/decks/sports-grader-v2-final"),
      "/deck/sports-grader-v2-final",
    );
    assertEquals(
      toggleLayoutMode("/deck/complex-deck-name-123"),
      "/eval/decks/complex-deck-name-123",
    );
  });
});

Deno.test("Layout Mode Round-trip Conversion", async (t) => {
  await t.step("should maintain consistency in round-trip conversions", () => {
    const originalPaths = [
      "/eval/decks/sports-grader",
      "/eval/decks/test-deck/sample/sample-001",
      "/eval/decks/my-deck/grading",
      "/deck/sports-grader",
      "/deck/test-deck/sample/sample-001",
      "/deck/my-deck/grading",
    ];

    for (const originalPath of originalPaths) {
      const toggled = toggleLayoutMode(originalPath);
      const toggledBack = toggleLayoutMode(toggled);

      // For paths that can be toggled, toggling twice should return to original
      if (
        originalPath.startsWith("/eval/decks/") ||
        originalPath.startsWith("/deck/")
      ) {
        assertEquals(
          toggledBack,
          originalPath,
          `Round-trip failed for ${originalPath}`,
        );
      }
    }
  });

  await t.step("should preserve query parameters in round-trip", () => {
    const pathWithQuery = "/eval/decks/test-deck?tab=results&mode=debug";
    const toggled = toggleLayoutMode(pathWithQuery);
    const toggledBack = toggleLayoutMode(toggled);

    assertEquals(toggled, "/deck/test-deck?tab=results&mode=debug");
    assertEquals(toggledBack, pathWithQuery);
  });
});
