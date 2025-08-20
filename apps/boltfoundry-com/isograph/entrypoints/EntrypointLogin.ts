import { iso } from "@iso-bfc";

export const EntrypointLogin = iso(`
  field Query.EntrypointLogin {
    currentViewer {
      LoginPage
    }
  }
`)(function EntrypointLogin({ data }) {
  const Body = data.currentViewer?.LoginPage;
  const title = "Sign In - Bolt Foundry";
  return { Body, title };
});
