/// <reference types="@types/google.accounts" />

import { useEffect, useRef, useState } from "react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { useAppEnvironment } from "../contexts/AppEnvironmentContext.tsx";
import {
  initializeGoogleAuthDevMock,
  setMockEmail,
  shouldUseGoogleAuthDevMock,
} from "../utils/googleAuthDevMock.ts";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";

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
  const [forceRealButton, setForceRealButton] = useState(false);
  const appEnvironment = useAppEnvironment();
  const { input1, setInput1, addButton, removeButton, sendMessage, showHud } =
    useHud();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<
    ((response: { credential: string }) => void) | null
  >(null);

  // Add HUD button to toggle between mock and real Google button
  useEffect(() => {
    // Only add button in development
    if (shouldUseGoogleAuthDevMock()) {
      // Set default email if not already set
      if (!input1) {
        setInput1("dev@boltfoundry.com");
      }

      // Store the email for the mock to use
      setMockEmail(input1);

      addButton({
        id: "toggle-google-auth-mock",
        label: forceRealButton ? "Use Mock Button" : "Use Real Button",
        onClick: () => {
          setForceRealButton(!forceRealButton);
          if (forceRealButton) {
            sendMessage("Switched to mock Google button", "success");
          } else {
            sendMessage(
              "Switched to real Google button. Note: Real OAuth won't work with dynamic hostnames like " +
                globalThis.location.hostname +
                ". Use SSH port forwarding (ssh -L 8000:localhost:8000) or re-enable mock.",
              "warning",
            );
          }
        },
        icon: forceRealButton ? "code" : "external-link",
      });

      // Add a button to set the current input as the auth email
      addButton({
        id: "set-auth-email",
        label: "Set Auth Email",
        onClick: () => {
          if (!input1 || !input1.includes("@")) {
            sendMessage(
              "Please enter a valid email address in Input 1",
              "error",
            );
            return;
          }
          setMockEmail(input1);
          sendMessage(`Mock auth will use email: ${input1}`, "success");
        },
        icon: "mail",
      });

      return () => {
        removeButton("toggle-google-auth-mock");
        removeButton("set-auth-email");
      };
    }
  }, [
    forceRealButton,
    input1,
    addButton,
    removeButton,
    sendMessage,
    setInput1,
  ]);

  useEffect(() => {
    // Store the callback ref so we can use it in the message handler
    callbackRef.current = handleCredentialResponse;

    // Check if we should use the dev mock (unless forced to use real button)
    const useDevMock = shouldUseGoogleAuthDevMock() && !forceRealButton;

    const client_id = getGoogleClientId(appEnvironment.GOOGLE_OAUTH_CLIENT_ID);
    if (!client_id) {
      logger.error("GOOGLE_OAUTH_CLIENT_ID is not set");
      setError(
        "Google OAuth is not configured. Please check server configuration.",
      );
      return;
    }

    if (useDevMock) {
      logger.info("Using Google Auth dev mock");
      // Initialize the mock
      initializeGoogleAuthDevMock();

      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        if (globalThis.google && googleButtonRef.current) {
          globalThis.google.accounts.id.initialize({
            client_id,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          globalThis.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
      }, 0);
    } else {
      // Production mode - load real Google script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

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
    }

    // Cleanup function for both mock and real modes
    return () => {
      // Remove any existing scripts
      const scripts = document.querySelectorAll(
        'script[src*="accounts.google.com"]',
      );
      scripts.forEach((script) => script.remove());

      // Clear the mock if it exists
      if (globalThis.google?.accounts?.id) {
        // @ts-expect-error - deleting mock google object
        delete globalThis.google;
      }
    };
  }, [appEnvironment, forceRealButton]);

  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    setError(null);
    logger.info("Google credential received", {
      hasCredential: !!response.credential,
    });

    // Show HUD with logging in message
    showHud();
    sendMessage("Logging in...", "info");

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

      // Redirect to the specified location from the server response
      if (result.redirectTo) {
        globalThis.location.href = result.redirectTo;
      } else {
        // Default redirect if no specific location provided
        globalThis.location.href = "/";
      }
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

  // Check if we're in development mode without our mock
  const isDevelopment = appEnvironment.mode === "development";
  const useDevMock = shouldUseGoogleAuthDevMock() && !forceRealButton;

  logger.info("LoginWithGoogleButton environment check:", {
    mode: appEnvironment.mode,
    BF_ENV: appEnvironment.BF_ENV,
    isDevelopment,
    useDevMock,
  });

  // Always show the Google button container - the mock will handle dev mode
  return <div ref={googleButtonRef}></div>;
}
