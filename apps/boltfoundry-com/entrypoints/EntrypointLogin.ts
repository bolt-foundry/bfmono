import { iso } from "@iso-bfc";

export const EntrypointLogin = iso(`
  field Query.EntrypointLogin {
    currentViewer {
      __typename
      id
      personBfGid
      orgBfOid
      LoginPage
      asCurrentViewerLoggedIn {
        organization {
          id
          name
          domain
        }
        person {
          id
          name
          email
        }
      }
    }
  }
`)(function EntrypointLogin({ data }) {
  const Body = data.currentViewer?.LoginPage;
  const title = "Sign In - Bolt Foundry";

  return { Body, title };
});
