import { assertEquals } from "@std/assert";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("Route Parameter Extraction", async (t) => {
  await t.step("should extract single parameter", () => {
    const result = matchRouteWithParams("/deck/abc123", "/deck/:deckId");
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should extract multiple parameters", () => {
    const result = matchRouteWithParams(
      "/deck/abc123/sample/xyz789",
      "/deck/:deckId/sample/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123", sampleId: "xyz789" },
      queryParams: {},
    });
  });

  await t.step("should extract eval system parameters", () => {
    const result = matchRouteWithParams(
      "/eval/decks/deck123/sample/sample456",
      "/eval/decks/:deckId/sample/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "deck123", sampleId: "sample456" },
      queryParams: {},
    });
  });

  await t.step(
    "should extract query parameters alongside route parameters",
    () => {
      const result = matchRouteWithParams(
        "/deck/abc123?tab=grading&mode=review",
        "/deck/:deckId",
      );
      assertEquals(result, {
        match: true,
        params: { deckId: "abc123" },
        queryParams: { tab: "grading", mode: "review" },
      });
    },
  );

  await t.step("should handle empty query parameters", () => {
    const result = matchRouteWithParams(
      "/deck/abc123?",
      "/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should not match when segment count differs", () => {
    const result = matchRouteWithParams(
      "/deck/abc123/extra",
      "/deck/:deckId",
    );
    assertEquals(result, {
      match: false,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should not match when static segments differ", () => {
    const result = matchRouteWithParams(
      "/deck/abc123",
      "/board/:deckId",
    );
    assertEquals(result, {
      match: false,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should handle empty parameters", () => {
    const result = matchRouteWithParams(
      "/deck/",
      "/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "" },
      queryParams: {},
    });
  });

  await t.step("should still handle exact matches", () => {
    const result = matchRouteWithParams("/eval", "/eval");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should still handle wildcard patterns", () => {
    const result = matchRouteWithParams("/ui/demo", "/ui/*");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should handle wildcard base path", () => {
    const result = matchRouteWithParams("/ui", "/ui/*");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should match /eval/decks", () => {
    const result = matchRouteWithParams("/eval/decks", "/eval/decks");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should match deck overview route", () => {
    const result = matchRouteWithParams(
      "/eval/decks/sports-grader-v2",
      "/eval/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match grading route", () => {
    const result = matchRouteWithParams(
      "/eval/decks/sports-grader-v2/grading",
      "/eval/decks/:deckId/grading",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match fullscreen deck route", () => {
    const result = matchRouteWithParams(
      "/deck/sports-grader-v2",
      "/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match fullscreen sample route", () => {
    const result = matchRouteWithParams(
      "/deck/sports-grader-v2/sample/sample-001",
      "/deck/:deckId/sample/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2", sampleId: "sample-001" },
      queryParams: {},
    });
  });
});
