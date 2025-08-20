import { iso } from "@iso-bfc";

export const EntrypointRlhf = iso(`
  field Query.EntrypointRlhf {
    currentViewer {
      __typename
      LoginPage
      RlhfHome
    }
  }
`)(function EntrypointRlhf({ data }) {
  if (data.currentViewer?.__typename === "CurrentViewerLoggedOut") {
    const Body = data.currentViewer.LoginPage;
    const title = "Sign In Required - RLHF";
    return { Body, title };
  }

  const Body = data.currentViewer?.RlhfHome;
  const title = "RLHF - Bolt Foundry";
  return { Body, title };
});
