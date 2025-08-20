import { iso } from "@iso-bfc";
// React type import not needed

export const EntrypointDeckDetail = iso(`
  field Query.EntrypointDeckDetail {
    currentViewer {
      asCurrentViewerLoggedIn {
        organization {
          name
        }
      }
    }
  }
`)(function EntrypointDeckDetail({ data }) {
  const organization = data.currentViewer?.asCurrentViewerLoggedIn
    ?.organization;

  if (!organization) {
    return {
      Body: () => <div>Not logged in</div>,
      title: "Not Logged In",
    };
  }

  return {
    Body: () => (
      <div>
        <h1>Organization: {organization.name}</h1>
        <p>Deck detail view placeholder</p>
      </div>
    ),
    title: "Deck Detail",
  };
});
