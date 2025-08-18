import { Plinko } from "./components/plinko/Plinko.tsx";
import { UIDemo } from "./components/UIDemo.tsx";
import type { BfIsographEntrypoint } from "./lib/BfIsographEntrypoint.ts";
import {
  entrypointEval,
  entrypointHome,
  entrypointLogin,
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

  // V3 Simplified Eval System Routes
  ["/pg", entrypointEval], // Redirects to /pg/grade/decks
  ["/pg/grade", entrypointEval], // Redirects to /pg/grade/decks
  ["/pg/grade/decks", entrypointEval], // Decks list (main content)
  ["/pg/grade/decks/:deckId", entrypointEval], // Deck detail view (redirects to samples tab)
  ["/pg/grade/decks/:deckId/:tab", entrypointEval], // Deck detail with tab (samples/graders/inbox)
  ["/pg/grade/decks/:deckId/grade", entrypointEval], // Grading interface for deck
  ["/pg/grade/samples", entrypointEval], // All samples list
  ["/pg/grade/samples/:sampleId", entrypointEval], // Sample detail view
  ["/pg/analyze", entrypointEval], // Analyze view
  ["/pg/chat", entrypointEval], // Chat view
]);
