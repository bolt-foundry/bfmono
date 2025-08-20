import { iso } from "@iso-bfc";

/**
 * Grade component - Main component for the evaluation/grading system
 * This is a field on CurrentViewerLoggedIn that renders the deck list view
 * Fetches the organization's decks for authenticated users
 */
export const Grade = iso(`
  field CurrentViewerLoggedIn.Grade @component {
    organization {
      id
      name
      decks(first: 50) {
        edges {
          node {
            id
            name
            description
            slug
          }
        }
      }
    }
  }
`)(function Grade(props) {
  const organization = props.data.organization;
  const decks = organization?.decks?.edges || [];

  // If no organization or no decks, show empty state
  if (!organization) {
    return (
      <div className="eval-page">
        <div className="eval-layout">
          <div className="eval-content">
            <div className="main-content">
              <div className="decks-header">
                <h1>Evaluation Decks</h1>
              </div>
              <div className="bfds-empty-state">
                <p>No organization found. Please log in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="eval-page">
        <div className="eval-layout">
          <div className="eval-content">
            <div className="main-content">
              <div className="decks-header">
                <h1>Evaluation Decks</h1>
                <p className="org-name">Organization: {organization.name}</p>
              </div>
              <div className="bfds-empty-state">
                <p>No decks found. Create your first deck to get started.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-page">
      <div className="eval-layout">
        <div className="eval-content">
          {/* Main content area - deck list */}
          <div className="main-content">
            <div className="decks-header">
              <h1>Evaluation Decks</h1>
              <p className="org-name">Organization: {organization.name}</p>
            </div>
            <div className="decks-list">
              {decks.map((edge) => {
                const deck = edge?.node;
                return (
                  <div key={deck?.id} className="deck-item">
                    <h3>{deck?.name}</h3>
                    <p>{deck?.description || "No description"}</p>
                    <p className="deck-slug">Slug: {deck?.slug}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
