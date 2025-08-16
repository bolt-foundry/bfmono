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

  // Eval System Routes - All handled by single entrypoint
  ["/eval", entrypointEval], // Eval landing page
  ["/eval/decks", entrypointEval], // Decks list view
  ["/eval/decks/:deckId", entrypointEval], // Deck overview
  ["/eval/decks/:deckId/sample/:sampleId", entrypointEval], // Sample view
  ["/eval/decks/:deckId/grading", entrypointEval], // Grading view

  // Fullscreen Routes - Same entrypoint, different layout mode
  ["/deck/:deckId", entrypointEval], // Fullscreen deck view
  ["/deck/:deckId/sample/:sampleId", entrypointEval], // Fullscreen sample view
  ["/deck/:deckId/grading", entrypointEval], // Fullscreen grading view
]);
