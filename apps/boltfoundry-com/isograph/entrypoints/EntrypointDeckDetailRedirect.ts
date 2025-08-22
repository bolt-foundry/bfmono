import { iso } from "@iso-bfc";

/**
 * EntrypointDeckDetailRedirect - Redirect entrypoint for /pg/grade/decks/:deckId route
 * Redirects to /pg/grade/decks/:deckId/inbox to show the inbox tab by default
 */
export const EntrypointDeckDetailRedirect = iso(`
  field Query.EntrypointDeckDetailRedirect {
    __typename
  }
`)(
  function EntrypointDeckDetailRedirect(
    props: { data: { __typename: string }; parameters: { deckId?: string } },
  ) {
    // The deckId comes from route params passed via parameters
    const deckId = props.parameters.deckId || "";

    // Return a redirect response to the inbox tab
    return {
      Body: null,
      title: "Redirecting...",
      status: 302,
      headers: {
        Location: `/pg/grade/decks/${deckId}/inbox`,
      },
    };
  },
);
