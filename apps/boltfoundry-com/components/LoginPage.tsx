import { iso } from "@iso-bfc";
import { LoginWithGoogleButton } from "./LoginWithGoogleButton.tsx";
import { Nav } from "./Nav.tsx";

export const LoginPage = iso(`
  field CurrentViewer.LoginPage @component {
    __typename
    id
    personBfGid
    orgBfOid
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
`)(function LoginPageComponent({ data }) {
  if (data.__typename === "CurrentViewerLoggedIn") {
    return (
      <div className="landing-page with-header">
        <Nav page="login" currentViewer={data} />
        <div className="landing-content">
          <h1>Already Signed In</h1>
          <p>Welcome back! You're already signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page with-header">
      <Nav page="login" currentViewer={data} />
      <div className="landing-content">
        <h1>Sign In to Bolt Foundry</h1>
        <p>Sign in with your Google Workspace account to continue</p>
        <LoginWithGoogleButton />
      </div>
    </div>
  );
});
