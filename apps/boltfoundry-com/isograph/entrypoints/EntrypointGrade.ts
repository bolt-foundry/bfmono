import { iso } from "@iso-bfc";

/**
 * EntrypointGrade - Redirect entrypoint for /pg/grade route
 * Redirects to /pg/grade/decks to show the main deck list
 */
export const EntrypointGrade = iso(`
  field Query.EntrypointGrade {
    __typename
  }
`)(function EntrypointGrade() {
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
