/// <reference types="@types/google.accounts" />

import { useEffect, useRef, useState } from "react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { useAppEnvironment } from "../contexts/AppEnvironmentContext.tsx";
import { BfDsCallout } from "@bfmono/apps/bfDs/components/BfDsCallout.tsx";

const logger = getLogger(import.meta);

// In development, we need to get this from the server
// In production, it would be injected during SSR
const getGoogleClientId = (envClientId?: string) => {
  // Check multiple sources for the client ID
  // @ts-expect-error - globalThis.__ENVIRONMENT__ is injected by server
  const fromGlobal = globalThis.__ENVIRONMENT__?.GOOGLE_OAUTH_CLIENT_ID;
  // @ts-expect-error - import.meta.env might not have this typed
  const fromVite = import.meta.env?.VITE_GOOGLE_OAUTH_CLIENT_ID;
  // Hardcoded fallback for development (from .env.local)
  const fallback =
    "1053566961455-rreuknvho4jqcj184evmj93n7n1nrjun.apps.googleusercontent.com";

  const clientId = envClientId || fromGlobal || fromVite || fallback;
  logger.info("Google Client ID sources:", {
    envClientId,
    fromGlobal,
    fromVite,
    using: clientId,
  });
  return clientId;
};

export function LoginWithGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appEnvironment = useAppEnvironment();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<
    ((response: { credential: string }) => void) | null
  >(null);

  useEffect(() => {
    // Store the callback ref so we can use it in the message handler
    callbackRef.current = handleCredentialResponse;

    // Check if we're in dev mode
    const isDev = appEnvironment.BF_ENV === "development" ||
      appEnvironment.BF_ENV === "dev";

    // Set up message listener for dev auth popup
    if (isDev) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "dev-auth-response" && callbackRef.current) {
          logger.info("Received dev auth response from popup");
          callbackRef.current({ credential: event.data.credential });
        }
      };
      globalThis.addEventListener("message", handleMessage);

      // Cleanup
      return () => {
        globalThis.removeEventListener("message", handleMessage);
      };
    }

    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const client_id = getGoogleClientId(appEnvironment.GOOGLE_OAUTH_CLIENT_ID);
    if (!client_id) {
      logger.error("GOOGLE_OAUTH_CLIENT_ID is not set");
      setError(
        "Google OAuth is not configured. Please check server configuration.",
      );
      return;
    }

    // Initialize Google Identity Services when script loads
    script.onload = () => {
      if (globalThis.google && googleButtonRef.current) {
        globalThis.google.accounts.id.initialize({
          client_id,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Display the Sign In With Google button
        globalThis.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    };

    return () => {
      // Clean up script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [appEnvironment.BF_ENV]);

  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    setError(null);
    logger.info("Google credential received", {
      hasCredential: !!response.credential,
    });

    try {
      // Send credential to backend for verification and session creation
      const loginResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const result = await loginResponse.json();
      logger.info("Login successful", result);

      // Redirect to dashboard or reload page
      globalThis.location.href = "/";
    } catch (err) {
      setIsLoading(false);
      setError("Failed to sign in with Google. Please try again.");
      logger.error("Google sign-in error:", err);
    }
  };

  // Show spinner while loading
  if (isLoading) {
    return <div>Signing in...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Check if we're in development mode
  const isDevelopment = appEnvironment.mode === "development";
  const isDevEnv = appEnvironment.BF_ENV === "development" ||
    appEnvironment.BF_ENV === "dev";

  logger.info("LoginWithGoogleButton environment check:", {
    mode: appEnvironment.mode,
    BF_ENV: appEnvironment.BF_ENV,
    isDevelopment,
    isDevEnv,
  });

  // Handler for dev login button
  const handleDevLogin = () => {
    const popupWidth = 500;
    const popupHeight = 600;
    const left = (globalThis.screen.width - popupWidth) / 2;
    const top = (globalThis.screen.height - popupHeight) / 2;

    globalThis.open(
      "/api/auth/dev-popup",
      "dev-auth-popup",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );
  };

  // Show Google Sign-In button with dev override if in dev mode
  return (
    <div>
      {isDevEnv
        ? (
          <button
            type="button"
            onClick={handleDevLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" className="mr-2">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Sign in with Google (Dev)
          </button>
        )
        : <div ref={googleButtonRef}></div>}
      {isDevelopment && !isDevEnv && (
        <BfDsCallout variant="warning" className="mt-5">
          <div>
            <h4>Development Environment</h4>
            <p>
              Google OAuth won't work with dynamic hostnames like{" "}
              <code>{globalThis.location.hostname}</code>.
            </p>
            <p>
              <strong>Solutions:</strong>
            </p>
            <ol>
              <li>
                Set BF_ENV=development to use dev authentication
              </li>
              <li>
                Or use SSH port forwarding:{" "}
                <code>ssh -L 8000:localhost:8000 [your-connection]</code>
              </li>
              <li>
                Then access via:{" "}
                <a href="http://localhost:8000/login">
                  http://localhost:8000/login
                </a>
              </li>
            </ol>
            <p>
              <strong>For testing:</strong>{" "}
              Use E2E mode with mock authentication:
            </p>
            <pre>BF_E2E_MODE=true bft dev boltfoundry-com</pre>
          </div>
        </BfDsCallout>
      )}
    </div>
  );
}
