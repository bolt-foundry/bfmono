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

  // V2 Eval System Routes - Hierarchical structure
  ["/pg", entrypointEval], // Eval landing page
  ["/pg/grade", entrypointEval], // Grade tool landing page
  ["/pg/grade/decks", entrypointEval], // Grading overview/sample list/inbox
  ["/pg/grade/decks/:deckId/samples", entrypointEval], // Sample list for deck
  ["/pg/grade/decks/:deckId/graders", entrypointEval], // Graders for deck
  ["/pg/grade/decks/:deckId/sample/:sampleId", entrypointEval], // Sample view
  ["/pg/grade/decks/:deckId/samples/grading", entrypointEval], // Grading view

  // V2 Fullscreen Routes - Singular forms for fullscreen mode
  ["/pg/grade/deck/:deckId", entrypointEval], // Fullscreen deck view
  ["/pg/grade/sample/:sampleId", entrypointEval], // Fullscreen sample view
  ["/pg/grade/deck/:deckId/samples/grading", entrypointEval], // Fullscreen grading view
]);
