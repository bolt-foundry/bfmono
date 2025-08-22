import { Plinko } from "./components/plinko/Plinko.tsx";
import { UIDemo } from "./components/UIDemo.tsx";
import type { BfIsographEntrypoint } from "./lib/BfIsographEntrypoint.ts";
import {
  entrypointDeckDetailRedirect,
  entrypointGrade,
  entrypointGradeDecks,
  entrypointHome,
  entrypointLogin,
  entrypointPg,
  entrypointPgMock,
  entrypointRlhf,
} from "./__generated__/builtRoutes.ts";

export type ComponentWithHeader = React.ComponentType<unknown> & {
  HeaderComponent?: React.ComponentType<unknown>;
};

export type RouteGuts = {
  Component: ComponentWithHeader;
};

export type RouteMap = Map<string, RouteGuts>;
export type IsographRoute = BfIsographEntrypoint;

// Traditional React routes
export const appRoutes = new Map<string, RouteGuts>([
  ["/plinko", { Component: Plinko }],
  ["/ui", { Component: UIDemo }],
  ["/ui/*", { Component: UIDemo }],
]);

// Isograph-powered routes
export const isographAppRoutes = new Map<string, IsographRoute>([
  ["/", entrypointHome],
  ["/login", entrypointLogin],
  ["/rlhf", entrypointRlhf],

  // Mock PG Interface - Legacy eval components
  ["/mock/pg", entrypointPgMock], // Mock version using shared/eval components
  ["/mock/pg/grade", entrypointPgMock], // Redirects to /mock/pg/grade/decks
  ["/mock/pg/grade/decks", entrypointPgMock], // Mock decks list
  ["/mock/pg/grade/decks/:deckId", entrypointPgMock], // Mock deck detail redirect to samples
  ["/mock/pg/grade/decks/:deckId/:tab", entrypointPgMock], // Mock deck detail with tab
  ["/mock/pg/grade/samples", entrypointPgMock], // Mock samples list
  ["/mock/pg/grade/samples/:sampleId", entrypointPgMock], // Mock sample detail
  ["/mock/pg/analyze", entrypointPgMock], // Mock analyze view
  ["/mock/pg/chat", entrypointPgMock], // Mock chat view

  // V3 Simplified Eval System Routes - Redirects
  ["/pg", entrypointPg], // Redirects to /pg/grade/decks
  ["/pg/grade", entrypointGrade], // Redirects to /pg/grade/decks

  // V3 Component Routes
  ["/pg/grade/decks", entrypointGradeDecks], // Decks list (main content)
  ["/pg/grade/decks/:deckId", entrypointDeckDetailRedirect], // Deck detail redirect to samples
  ["/pg/grade/decks/:deckId/:tab", entrypointGradeDecks], // Deck detail with tab (samples/graders/inbox) - handled by Grade component
  // ["/pg/grade/decks/:deckId/grade", entrypointGrading], // Grading interface for deck
  // ["/pg/grade/samples", entrypointSamples], // All samples list
  // ["/pg/grade/samples/:sampleId", entrypointSampleDetail], // Sample detail view
  // ["/pg/analyze", entrypointAnalyze], // Analyze view
  // ["/pg/chat", entrypointChat], // Chat view
]);
