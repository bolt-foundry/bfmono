import { iso } from "@iso-bfc";

/**
 * EntrypointPg - Redirect entrypoint for /pg route
 * Redirects to /pg/grade/decks to show the main deck list
 */
export const EntrypointPg = iso(`
  field Query.EntrypointPg {
    __typename
  }
`)(function EntrypointPg() {
  // Return a redirect response instead of a component
  return {
    Body: null,
    title: "Redirecting...",
    status: 302,
    headers: {
      Location: "/pg/grade/decks",
    },
  };
});
