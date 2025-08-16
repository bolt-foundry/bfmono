import { assertEquals } from "@std/assert";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("Route Parameter Extraction", async (t) => {
  await t.step("should extract single parameter", () => {
    const result = matchRouteWithParams(
      "/pg/grade/deck/abc123",
      "/pg/grade/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should extract multiple parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/abc123/sample/xyz789",
      "/pg/grade/decks/:deckId/sample/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123", sampleId: "xyz789" },
      queryParams: {},
    });
  });

  await t.step("should extract V2 system parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/deck123/sample/sample456",
      "/pg/grade/decks/:deckId/sample/:sampleId",
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
        "/pg/grade/deck/abc123?tab=grading&mode=review",
        "/pg/grade/deck/:deckId",
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
      "/pg/grade/deck/abc123?",
      "/pg/grade/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should not match when segment count differs", () => {
    const result = matchRouteWithParams(
      "/pg/grade/deck/abc123/extra",
      "/pg/grade/deck/:deckId",
    );
    assertEquals(result, {
      match: false,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should not match when static segments differ", () => {
    const result = matchRouteWithParams(
      "/pg/grade/deck/abc123",
      "/pg/grade/board/:deckId",
    );
    assertEquals(result, {
      match: false,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should handle empty parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/deck/",
      "/pg/grade/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "" },
      queryParams: {},
    });
  });

  await t.step("should still handle exact matches", () => {
    const result = matchRouteWithParams("/pg", "/pg");
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

  await t.step("should match /pg/grade/decks", () => {
    const result = matchRouteWithParams("/pg/grade/decks", "/pg/grade/decks");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should match deck samples route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2/samples",
      "/pg/grade/decks/:deckId/samples",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match grading route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2/samples/grading",
      "/pg/grade/decks/:deckId/samples/grading",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match fullscreen deck route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/deck/sports-grader-v2",
      "/pg/grade/deck/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match fullscreen sample route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/sample/sample-001",
      "/pg/grade/sample/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { sampleId: "sample-001" },
      queryParams: {},
    });
  });
});
