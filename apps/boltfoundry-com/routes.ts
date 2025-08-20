import { Plinko } from "./components/plinko/Plinko.tsx";
import { UIDemo } from "./components/UIDemo.tsx";
import type { BfIsographEntrypoint } from "./lib/BfIsographEntrypoint.ts";
import {
  entrypointGrade,
  entrypointGradeDecks,
  entrypointHome,
  entrypointLogin,
  entrypointPg,
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

  // V3 Simplified Eval System Routes - Redirects
  ["/pg", entrypointPg], // Redirects to /pg/grade/decks
  ["/pg/grade", entrypointGrade], // Redirects to /pg/grade/decks

  // V3 Component Routes
  ["/pg/grade/decks", entrypointGradeDecks], // Decks list (main content)
  // ["/pg/grade/decks/:deckId", entrypointDeckDetail], // Deck detail view
  // ["/pg/grade/decks/:deckId/:tab", entrypointDeckDetail], // Deck detail with tab (samples/graders/inbox)
  // ["/pg/grade/decks/:deckId/grade", entrypointGrading], // Grading interface for deck
  // ["/pg/grade/samples", entrypointSamples], // All samples list
  // ["/pg/grade/samples/:sampleId", entrypointSampleDetail], // Sample detail view
  // ["/pg/analyze", entrypointAnalyze], // Analyze view
  // ["/pg/chat", entrypointChat], // Chat view
]);
