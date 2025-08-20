import { assertEquals, assertExists } from "@std/assert";
import {
  createServerRedirectResponse,
  getRedirectFromEntrypoint,
  handleClientRedirect,
  isRedirect,
} from "./redirectHandler.ts";

Deno.test("redirectHandler", async (t) => {
  await t.step("isRedirect - should identify valid redirect", () => {
    const validRedirect = {
      Body: null,
      title: "Redirecting...",
      status: 302,
      headers: {
        Location: "/new-path",
      },
    };

    assertEquals(isRedirect(validRedirect), true);
  });

  await t.step("isRedirect - should reject non-redirect status codes", () => {
    const notRedirect = {
      Body: null,
      title: "Page",
      status: 200,
      headers: {
        Location: "/new-path",
      },
    };

    assertEquals(isRedirect(notRedirect), false);
  });

  await t.step("isRedirect - should reject missing headers", () => {
    const noHeaders = {
      Body: null,
      title: "Redirecting...",
      status: 302,
    };

    assertEquals(isRedirect(noHeaders), false);
  });

  await t.step("isRedirect - should reject missing Location header", () => {
    const noLocation = {
      Body: null,
      title: "Redirecting...",
      status: 302,
      headers: {},
    };

    assertEquals(isRedirect(noLocation), false);
  });

  await t.step("isRedirect - should reject null/undefined", () => {
    assertEquals(isRedirect(null), false);
    assertEquals(isRedirect(undefined), false);
  });

  await t.step("isRedirect - should reject non-objects", () => {
    assertEquals(isRedirect("string"), false);
    assertEquals(isRedirect(123), false);
    assertEquals(isRedirect(true), false);
  });

  await t.step(
    "createServerRedirectResponse - should create proper redirect response",
    () => {
      const response = createServerRedirectResponse("/redirect-path");

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("Location"), "/redirect-path");
      assertEquals(response.body, null);
    },
  );

  await t.step(
    "handleClientRedirect - should handle missing globalThis.location gracefully",
    () => {
      // Save original window
      const originalWindow = globalThis.window;

      try {
        // Remove window (simulating server environment)
        // deno-lint-ignore no-explicit-any
        delete (globalThis as any).window;

        // Should not throw
        handleClientRedirect("/new-path");
      } finally {
        // Restore window
        if (originalWindow) {
          // deno-lint-ignore no-explicit-any
          (globalThis as any).window = originalWindow;
        }
      }
    },
  );

  await t.step(
    "handleClientRedirect - should call location.replace when available",
    () => {
      // Save original window
      const originalWindow = globalThis.window;

      try {
        // Mock window.location.replace
        let replacedPath: string | undefined;
        // deno-lint-ignore no-explicit-any
        (globalThis as any).window = {
          location: {
            replace: (path: string) => {
              replacedPath = path;
            },
          },
        };

        handleClientRedirect("/new-path");

        assertEquals(replacedPath, "/new-path");
      } finally {
        // Restore window
        if (originalWindow) {
          // deno-lint-ignore no-explicit-any
          (globalThis as any).window = originalWindow;
        }
      }
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should extract redirect from entrypoint",
    () => {
      // Mock entrypoint with redirect resolver
      const mockEntrypoint = {
        readerWithRefetchQueries: {
          readerArtifact: {
            resolver: () => ({
              Body: null,
              title: "Redirecting...",
              status: 302,
              headers: {
                Location: "/pg/grade/decks",
              },
            }),
          },
        },
      };

      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertExists(redirect);
      assertEquals(redirect?.location, "/pg/grade/decks");
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should return null for non-redirect entrypoint",
    () => {
      // Mock entrypoint with normal resolver
      const mockEntrypoint = {
        readerWithRefetchQueries: {
          readerArtifact: {
            resolver: () => ({
              Body: () => "Component",
              title: "Page Title",
            }),
          },
        },
      };

      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertEquals(redirect, null);
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should handle missing resolver",
    () => {
      const mockEntrypoint = {
        readerWithRefetchQueries: {
          readerArtifact: {},
        },
      };

      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertEquals(redirect, null);
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should handle missing readerArtifact",
    () => {
      const mockEntrypoint = {
        readerWithRefetchQueries: {},
      };

      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertEquals(redirect, null);
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should handle missing readerWithRefetchQueries",
    () => {
      const mockEntrypoint = {};

      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertEquals(redirect, null);
    },
  );

  await t.step(
    "getRedirectFromEntrypoint - should handle resolver that throws",
    () => {
      const mockEntrypoint = {
        readerWithRefetchQueries: {
          readerArtifact: {
            resolver: () => {
              throw new Error("Resolver error");
            },
          },
        },
      };

      // Should not throw, but return null
      const redirect = getRedirectFromEntrypoint(mockEntrypoint);

      assertEquals(redirect, null);
    },
  );

  await t.step("Integration: Server-side redirect flow", () => {
    // Simulate the full server-side flow
    const mockEntrypoint = {
      readerWithRefetchQueries: {
        readerArtifact: {
          resolver: () => ({
            Body: null,
            title: "Redirecting...",
            status: 302,
            headers: {
              Location: "/dashboard",
            },
          }),
        },
      },
    };

    // 1. Check if entrypoint wants to redirect
    const redirect = getRedirectFromEntrypoint(mockEntrypoint);

    if (redirect) {
      // 2. Create server response
      const response = createServerRedirectResponse(redirect.location);

      // 3. Verify response
      assertEquals(response.status, 302);
      assertEquals(response.headers.get("Location"), "/dashboard");
    } else {
      throw new Error("Expected redirect but got null");
    }
  });

  await t.step("Integration: Client-side redirect flow", () => {
    // Simulate the full client-side flow
    const mockResult = {
      Body: null,
      title: "Redirecting...",
      status: 302,
      headers: {
        Location: "/profile",
      },
    };

    // 1. Check if result is a redirect
    if (isRedirect(mockResult)) {
      // 2. Mock window for testing
      const originalWindow = globalThis.window;
      let replacedPath: string | undefined;

      try {
        // deno-lint-ignore no-explicit-any
        (globalThis as any).window = {
          location: {
            replace: (path: string) => {
              replacedPath = path;
            },
          },
        };

        // 3. Handle the redirect
        handleClientRedirect(mockResult.headers.Location);

        // 4. Verify redirect was called
        assertEquals(replacedPath, "/profile");
      } finally {
        if (originalWindow) {
          // deno-lint-ignore no-explicit-any
          (globalThis as any).window = originalWindow;
        }
      }
    } else {
      throw new Error("Expected redirect but isRedirect returned false");
    }
  });
});
