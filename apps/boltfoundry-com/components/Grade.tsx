import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const Grade = iso(`
  field Query.Grade @component {
    currentViewer {
      id
      personBfGid
      orgBfOid
      asCurrentViewerLoggedIn {
        organization {
          id
          name
          domain
          DecksView
        }
      }
    }
  }
`)(function Grade({ data }) {
  // Get the organization data
  const organization = data?.currentViewer?.asCurrentViewerLoggedIn
    ?.organization;

  logger.debug("Grade component data:", { data, organization });

  if (!organization) {
    return <div>Loading organization...</div>;
  }

  // Get the DecksView component from organization
  const DecksView = organization.DecksView;

  // Render DecksView if available
  if (DecksView) {
    return <DecksView />;
  }

  // Fallback - just render the organization info
  return (
    <div>
      <h1>Organization: {organization.name}</h1>
      <p>Domain: {organization.domain}</p>
      <p>ID: {organization.id}</p>
    </div>
  );
});
