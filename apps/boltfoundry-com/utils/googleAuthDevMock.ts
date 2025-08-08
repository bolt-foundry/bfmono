/**
 * Google Auth Mock for Development Mode
 *
 * This provides a mock Google Identity Services implementation that:
 * - Renders a realistic Google Sign-In button
 * - Handles authentication with dev tokens
 * - Works seamlessly in development mode
 */

import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Store mock state in a module-level variable
const mockState: {
  callback?: (response: { credential: string; select_by: string }) => void;
  customEmail?: string;
} = {};

export function setMockEmail(email: string) {
  mockState.customEmail = email;
}

export function initializeGoogleAuthDevMock(customEmail?: string) {
  logger.info("Initializing Google Auth dev mock", { customEmail });
  if (customEmail) {
    mockState.customEmail = customEmail;
  }

  // Create mock Google Identity Services
  const mockGoogle = {
    accounts: {
      id: {
        initialize(config: {
          client_id: string;
          callback: (
            response: { credential: string; select_by: string },
          ) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) {
          logger.info(
            "Mock Google ID initialized with client_id:",
            config.client_id,
          );
          // Store the callback for later use
          // Store the callback in module state
          mockState.callback = config.callback;
        },

        renderButton(container: HTMLElement, options?: {
          type?: string;
          theme?: string;
          size?: string;
          text?: string;
          shape?: string;
          logo_alignment?: string;
        }) {
          logger.info("Rendering mock Google Sign-In button");

          // Create a button that looks exactly like Google's
          const button = document.createElement("button");
          button.id = "google-signin-button";
          button.type = "button";
          button.setAttribute("aria-label", "Sign in with Google");

          // Style to match Google's button exactly
          button.style.cssText = `
            background-color: #ffffff;
            border: 1px solid #dadce0;
            border-radius: 4px;
            box-sizing: border-box;
            color: #3c4043;
            cursor: pointer;
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            height: 40px;
            min-width: 240px;
            padding: 0 12px;
            position: relative;
            text-align: center;
            transition: background-color .218s, border-color .218s, box-shadow .218s;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          `;

          // Add hover effects
          button.onmouseover = () => {
            button.style.boxShadow =
              "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)";
            button.style.backgroundColor = "#f8f9fa";
          };

          button.onmouseout = () => {
            button.style.boxShadow =
              "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)";
            button.style.backgroundColor = "#ffffff";
          };

          button.onmousedown = () => {
            button.style.backgroundColor = "#e8e8e9";
          };

          button.onmouseup = () => {
            button.style.backgroundColor = "#f8f9fa";
          };

          // Google logo SVG
          const logoSvg = `
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          `;

          // Button text
          const buttonText = options?.text === "signin_with"
            ? "Sign in with Google"
            : "Sign up with Google";

          button.innerHTML = `${logoSvg}<span>${buttonText}</span>`;

          // Add click handler
          button.onclick = () => {
            logger.info("Mock Google Sign-In button clicked");

            // Simulate button press animation
            button.style.transform = "scale(0.98)";
            setTimeout(() => {
              button.style.transform = "scale(1)";

              // Create dev token with user info
              // Use email from mock state or default
              const email = mockState.customEmail || "dev@boltfoundry.com";
              const devToken = btoa(JSON.stringify({
                dev: true,
                email,
                name: email.split("@")[0].replace(/[._-]/g, " ").replace(
                  /\b\w/g,
                  (c) => c.toUpperCase(),
                ),
                sub: `dev-${email.replace(/[^a-zA-Z0-9]/g, "-")}`,
                email_verified: true,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
              }));

              // Get the stored callback
              const callback = mockState.callback;
              if (callback) {
                logger.info("Triggering auth callback with dev token", {
                  devToken,
                });
                callback({
                  credential: devToken,
                  select_by: "btn",
                });
              } else {
                logger.error(
                  "No callback found! Make sure google.accounts.id.initialize was called",
                );
              }
            }, 100);
          };

          // Clear container and add button
          container.innerHTML = "";
          container.appendChild(button);
        },

        prompt() {
          logger.info("Mock Google prompt called");
        },

        disableAutoSelect() {
          logger.info("Mock Google auto-select disabled");
        },
      },
    },
  };

  // Override the global google object
  // @ts-expect-error - setting mock google object on globalThis
  globalThis.google = mockGoogle;

  logger.info("Google Auth dev mock initialized successfully");
}

/**
 * Checks if we should use the dev mock based on environment
 */
export function shouldUseGoogleAuthDevMock(): boolean {
  // TODO: Fix BF_ENV detection and remove this hardcoded return
  return true;

  // Unreachable code below - kept for reference
  // const isDev = import.meta.env?.DEV ||
  //   // @ts-expect-error - reading environment from globalThis
  //   globalThis.__ENVIRONMENT__?.mode === "development";
  // // @ts-expect-error - reading environment from globalThis
  // const bfEnv = globalThis.__ENVIRONMENT__?.BF_ENV;
  // // @ts-expect-error - reading environment from globalThis
  // const isE2E = globalThis.__ENVIRONMENT__?.BF_E2E_MODE === "true";
  //
  // return isDev || bfEnv === "development" || bfEnv === "dev" || isE2E;
}
