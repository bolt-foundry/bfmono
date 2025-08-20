import { iso } from "@iso-bfc";
import { LoginWithGoogleButton } from "@bfmono/apps/boltfoundry-com/components/LoginWithGoogleButton.tsx";
import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";

export const LoginPage = iso(`
  field CurrentViewer.LoginPage @component {
    __typename
  }
`)(function LoginPageComponent({ data }) {
  if (data.__typename === "CurrentViewerLoggedIn") {
    return (
      <div className="landing-page with-header">
        <Nav page="login" />
        <div className="landing-content">
          <h1>Already Signed In</h1>
          <p>Welcome back! You're already signed in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page with-header">
      <Nav page="login" />
      <div className="landing-content">
        <h1>Sign In to Bolt Foundry</h1>
        <p>Sign in with your Google Workspace account to continue</p>
        <LoginWithGoogleButton />
      </div>
    </div>
  );
});
