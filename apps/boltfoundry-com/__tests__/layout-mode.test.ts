import { assertEquals } from "@std/assert";
import { getLayoutMode, toggleLayoutMode } from "../contexts/RouterContext.tsx";

Deno.test("Layout Mode Detection", async (t) => {
  await t.step("should detect normal mode for /pg routes", () => {
    assertEquals(getLayoutMode("/pg"), "normal");
    assertEquals(getLayoutMode("/pg/grade/decks"), "normal");
    assertEquals(
      getLayoutMode("/pg/grade/decks/sports-grader/samples"),
      "normal",
    );
    assertEquals(
      getLayoutMode("/pg/grade/decks/test-deck/sample/sample-001"),
      "normal",
    );
    assertEquals(
      getLayoutMode("/pg/grade/decks/my-deck/samples/grading"),
      "normal",
    );
  });

  await t.step("should detect fullscreen mode for singular routes", () => {
    assertEquals(getLayoutMode("/pg/grade/deck/sports-grader"), "fullscreen");
    assertEquals(
      getLayoutMode("/pg/grade/sample/sample-001"),
      "fullscreen",
    );
    assertEquals(
      getLayoutMode("/pg/grade/deck/my-deck/samples/grading"),
      "fullscreen",
    );
  });

  await t.step("should detect normal mode for other routes", () => {
    assertEquals(getLayoutMode("/"), "normal");
    assertEquals(getLayoutMode("/login"), "normal");
    assertEquals(getLayoutMode("/rlhf"), "normal");
    assertEquals(getLayoutMode("/ui"), "normal");
    assertEquals(getLayoutMode("/ui/demo"), "normal");
  });
});

Deno.test("Layout Mode Toggling - V2 Behavior", async (t) => {
  await t.step("should toggle deck samples to deck overview", () => {
    assertEquals(
      toggleLayoutMode("/pg/grade/decks/sports-grader/samples"),
      "/pg/grade/deck/sports-grader",
    );
    assertEquals(
      toggleLayoutMode("/pg/grade/decks/my-deck/samples"),
      "/pg/grade/deck/my-deck",
    );
  });

  await t.step("should toggle deck overview to deck samples", () => {
    assertEquals(
      toggleLayoutMode("/pg/grade/deck/sports-grader"),
      "/pg/grade/decks/sports-grader/samples",
    );
    assertEquals(
      toggleLayoutMode("/pg/grade/deck/my-deck"),
      "/pg/grade/decks/my-deck/samples",
    );
  });

  await t.step("should toggle sample view to sample-only view", () => {
    assertEquals(
      toggleLayoutMode("/pg/grade/decks/test-deck/sample/sample-001"),
      "/pg/grade/sample/sample-001",
    );
    assertEquals(
      toggleLayoutMode("/pg/grade/decks/sports-deck/sample/abc123"),
      "/pg/grade/sample/abc123",
    );
  });

  await t.step("should toggle grading views", () => {
    assertEquals(
      toggleLayoutMode("/pg/grade/decks/my-deck/samples/grading"),
      "/pg/grade/deck/my-deck/samples/grading",
    );
    assertEquals(
      toggleLayoutMode("/pg/grade/deck/test-deck/samples/grading"),
      "/pg/grade/decks/test-deck/samples/grading",
    );
  });

  await t.step("should preserve query parameters", () => {
    assertEquals(
      toggleLayoutMode(
        "/pg/grade/decks/test-deck/samples?tab=results&mode=debug",
      ),
      "/pg/grade/deck/test-deck?tab=results&mode=debug",
    );
    assertEquals(
      toggleLayoutMode("/pg/grade/deck/my-deck?view=compact"),
      "/pg/grade/decks/my-deck/samples?view=compact",
    );
  });

  await t.step("should handle non-toggleable routes", () => {
    // Routes that don't have a toggle equivalent should remain unchanged
    assertEquals(toggleLayoutMode("/pg"), "/pg");
    assertEquals(toggleLayoutMode("/pg/grade/decks"), "/pg/grade/decks");
    assertEquals(toggleLayoutMode("/login"), "/login");
    assertEquals(toggleLayoutMode("/ui"), "/ui");
    // Sample-only routes can't toggle back without deck context
    assertEquals(
      toggleLayoutMode("/pg/grade/sample/sample-001"),
      "/pg/grade/sample/sample-001",
    );
  });
});

Deno.test("Layout Mode Round-trip Behavior", async (t) => {
  await t.step("should handle round-trip for deck samples/overview", () => {
    const originalPath = "/pg/grade/decks/sports-grader/samples";
    const toggled = toggleLayoutMode(originalPath);
    const toggledBack = toggleLayoutMode(toggled);

    assertEquals(toggled, "/pg/grade/deck/sports-grader");
    assertEquals(toggledBack, originalPath);
  });

  await t.step("should handle round-trip for grading views", () => {
    const originalPath = "/pg/grade/decks/my-deck/samples/grading";
    const toggled = toggleLayoutMode(originalPath);
    const toggledBack = toggleLayoutMode(toggled);

    assertEquals(toggled, "/pg/grade/deck/my-deck/samples/grading");
    assertEquals(toggledBack, originalPath);
  });

  await t.step("should preserve query parameters in round-trip", () => {
    const pathWithQuery =
      "/pg/grade/decks/test-deck/samples?tab=results&mode=debug";
    const toggled = toggleLayoutMode(pathWithQuery);
    const toggledBack = toggleLayoutMode(toggled);

    assertEquals(toggled, "/pg/grade/deck/test-deck?tab=results&mode=debug");
    assertEquals(toggledBack, pathWithQuery);
  });

  await t.step("should handle one-way toggles (sample views)", () => {
    // Sample views lose deck context when toggled to fullscreen
    const originalPath = "/pg/grade/decks/test-deck/sample/sample-001";
    const toggled = toggleLayoutMode(originalPath);

    assertEquals(toggled, "/pg/grade/sample/sample-001");
    // Cannot toggle back to original without deck context
    assertEquals(toggleLayoutMode(toggled), toggled);
  });
});
