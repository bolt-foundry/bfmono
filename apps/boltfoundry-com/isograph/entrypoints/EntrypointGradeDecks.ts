import { iso } from "@iso-bfc";
import { FallbackDecks } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/FallbackDecks.tsx";

/**
 * EntrypointGradeDecks - Main entrypoint for /pg/grade/decks route
 * Shows the list of decks for the current organization
 * Requires authentication - redirects to login if not authenticated
 */
export const EntrypointGradeDecks = iso(`
  field Query.EntrypointGradeDecks {
    currentViewer {
      __typename
      asCurrentViewerLoggedOut {
        LoginPage
      }
      asCurrentViewerLoggedIn {
        Grade
      }
    }
  }
`)(function EntrypointGradeDecks({ data }) {
  // Check if user is logged in
  if (data.currentViewer?.__typename === "CurrentViewerLoggedOut") {
    // Option 1: Return redirect response
    return {
      Body: null,
      title: "Redirecting to login...",
      status: 302,
      headers: { Location: "/login?redirect=/pg/grade/decks" },
    };

    // Option 2: Render login page in place
    // const Body = data.currentViewer.asCurrentViewerLoggedOut?.LoginPage;
    // const title = "Sign In Required - Decks";
    // return { Body, title };
  }

  // User is logged in, show the Grade component
  const Body = data.currentViewer?.asCurrentViewerLoggedIn?.Grade ||
    FallbackDecks;
  const title = "Decks - Bolt Foundry";

  return { Body, title };
});
