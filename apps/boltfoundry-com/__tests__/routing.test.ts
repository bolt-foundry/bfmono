import { assertEquals } from "@std/assert";
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

Deno.test("Route Parameter Extraction", async (t) => {
  await t.step("should extract single parameter", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/abc123",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should extract multiple parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/abc123/samples/xyz789",
      "/pg/grade/decks/:deckId/samples/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123", sampleId: "xyz789" },
      queryParams: {},
    });
  });

  await t.step("should extract V2 system parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/deck123/samples/sample456",
      "/pg/grade/decks/:deckId/samples/:sampleId",
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
        "/pg/grade/decks/abc123?tab=grading&mode=review",
        "/pg/grade/decks/:deckId",
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
      "/pg/grade/decks/abc123?",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "abc123" },
      queryParams: {},
    });
  });

  await t.step("should not match when segment count differs", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/abc123/extra",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: false,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should not match when static segments differ", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/abc123",
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
      "/pg/grade/decks/empty/",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "empty" },
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

  await t.step("should match /pg/grade redirect route", () => {
    const result = matchRouteWithParams("/pg/grade", "/pg/grade");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should match deck detail route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match deck samples tab route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2/samples",
      "/pg/grade/decks/:deckId/:tab",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2", tab: "samples" },
      queryParams: {},
    });
  });

  await t.step("should match deck graders tab route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2/graders",
      "/pg/grade/decks/:deckId/:tab",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2", tab: "graders" },
      queryParams: {},
    });
  });

  await t.step("should match grading route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/sports-grader-v2/grade",
      "/pg/grade/decks/:deckId/grade",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "sports-grader-v2" },
      queryParams: {},
    });
  });

  await t.step("should match sample detail route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/samples/sample-001",
      "/pg/grade/samples/:sampleId",
    );
    assertEquals(result, {
      match: true,
      params: { sampleId: "sample-001" },
      queryParams: {},
    });
  });

  await t.step("should match samples list route", () => {
    const result = matchRouteWithParams(
      "/pg/grade/samples",
      "/pg/grade/samples",
    );
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should normalize trailing slashes", () => {
    const result = matchRouteWithParams("/pg/", "/pg");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should normalize trailing slashes with parameters", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/fastpitch/",
      "/pg/grade/decks/:deckId",
    );
    assertEquals(result, {
      match: true,
      params: { deckId: "fastpitch" },
      queryParams: {},
    });
  });

  await t.step("should preserve root slash", () => {
    const result = matchRouteWithParams("/", "/");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should normalize trailing slashes with query params", () => {
    const result = matchRouteWithParams(
      "/pg/grade/decks/?tab=grading",
      "/pg/grade/decks",
    );
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: { tab: "grading" },
    });
  });

  await t.step("should match analyze route", () => {
    const result = matchRouteWithParams("/pg/analyze", "/pg/analyze");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });

  await t.step("should match chat route", () => {
    const result = matchRouteWithParams("/pg/chat", "/pg/chat");
    assertEquals(result, {
      match: true,
      params: {},
      queryParams: {},
    });
  });
});
