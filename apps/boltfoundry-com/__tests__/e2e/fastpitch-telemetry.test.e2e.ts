import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { assert } from "@std/assert";
import { withIsolatedDb } from "@bfmono/apps/bfDb/bfDb.ts";
// Removed unused imports - using withIsolatedDb instead
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
// smoothClick is no longer needed - using context.click() instead
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { generate as fastpitchGenerate } from "@bfmono/infra/bft/tasks/fastpitch.bft.ts";

const logger = getLogger(import.meta);

async function setupFastpitchData() {
  // Create a test CSV file with sample articles
  const csvContent =
    `id,title,content,url,published_at,scraped_at,source_id,relevance_score
1,"Deno 2.0 Released","Deno 2.0 brings major improvements to Node.js compatibility and performance","https://deno.com/blog/v2.0",2024-01-15,2024-01-15,deno-blog,0.95
2,"React Server Components Stable","React 19 marks Server Components as stable for production use","https://react.dev/blog/rsc-stable",2024-01-14,2024-01-14,react-blog,0.92
3,"Rust 1.75 Released","New Rust version includes async traits and improved compile times","https://blog.rust-lang.org/1.75",2024-01-13,2024-01-13,rust-blog,0.88
4,"GitHub Copilot Workspace","New AI-powered development environment from GitHub","https://github.blog/copilot-workspace",2024-01-12,2024-01-12,github-blog,0.90
5,"PostgreSQL 16.1","Minor release with important security fixes","https://postgresql.org/about/news/16.1",2024-01-11,2024-01-11,pg-news,0.75
6,"TypeScript 5.3","Improved performance and new type features","https://devblogs.microsoft.com/typescript/5.3",2024-01-10,2024-01-10,ts-blog,0.85
7,"Chrome DevTools Updates","New performance profiling features in Chrome 121","https://developer.chrome.com/blog/devtools",2024-01-09,2024-01-09,chrome-blog,0.70`;

  const testDataPath = await Deno.makeTempFile({
    prefix: "fastpitch-test-",
    suffix: ".csv",
  });

  await Deno.writeTextFile(testDataPath, csvContent);
  logger.debug(`Created test data file: ${testDataPath}`);

  return testDataPath;
}

// Mock OpenRouter API response for testing
function mockOpenRouterResponse() {
  // Override fetch to intercept OpenRouter calls
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    // Intercept OpenRouter API calls
    if (
      url.includes("openrouter.ai") || url.includes("api/v1/chat/completions")
    ) {
      logger.debug("Intercepting OpenRouter API call");

      // Return mock response
      return new Response(
        JSON.stringify({
          id: "test-completion",
          object: "chat.completion",
          created: Date.now(),
          model: "gpt-4",
          choices: [{
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify({
                selected_stories: [
                  {
                    title: "Deno 2.0 Released",
                    summary:
                      "Deno 2.0 brings major improvements to Node.js compatibility with npm support and 3x faster performance.",
                    url: "https://deno.com/blog/v2.0",
                    reasoning:
                      "Major runtime update that affects TypeScript developers and those considering Deno as a Node alternative",
                  },
                  {
                    title: "React Server Components Stable",
                    summary:
                      "React 19 marks Server Components as stable, enabling better performance and smaller client bundles in production apps.",
                    url: "https://react.dev/blog/rsc-stable",
                    reasoning:
                      "Fundamental shift in React architecture that all React developers need to understand for modern app development",
                  },
                  {
                    title: "GitHub Copilot Workspace",
                    summary:
                      "GitHub launches AI-powered development environment that can plan and implement entire features from natural language.",
                    url: "https://github.blog/copilot-workspace",
                    reasoning:
                      "Revolutionary AI tool that could significantly change how developers write and review code",
                  },
                  {
                    title: "Rust 1.75 Released",
                    summary:
                      "Rust 1.75 introduces async traits and 20% faster compile times for large projects.",
                    url: "https://blog.rust-lang.org/1.75",
                    reasoning:
                      "Important for systems programmers and those using Rust for performance-critical applications",
                  },
                  {
                    title: "TypeScript 5.3",
                    summary:
                      "TypeScript 5.3 delivers 30% faster type checking and new import attributes for better module control.",
                    url: "https://devblogs.microsoft.com/typescript/5.3",
                    reasoning:
                      "Performance improvements directly impact developer productivity for the majority of web developers using TypeScript",
                  },
                ],
              }),
            },
            finish_reason: "stop",
          }],
          usage: {
            prompt_tokens: 1200,
            completion_tokens: 450,
            total_tokens: 1650,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Pass through all other requests
    return originalFetch(input, init);
  };

  return () => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  };
}

Deno.test({
  name: "Phase 1 & 2: Fastpitch telemetry to dashboard flow",
  sanitizeResources: false, // Disable resource leak detection for this test
  fn: async (t) => {
    await withIsolatedDb(async () => {
      const context = await setupBoltFoundryComTest();
      let testDataPath: string | undefined;
      let orgId: string | undefined;

      try {
        // Start video recording
        const { stop, showSubtitle } = await context
          .startRecording(
            "fastpitch-telemetry-test",
          );

        await showSubtitle(
          "🚀 Phase 1 & 2: Fastpitch Telemetry to Dashboard Test",
        );

        await t.step("1. Navigate to homepage and login", async () => {
          logger.debug("Navigating to homepage...");
          await navigateTo(context, "/");
          await context.waitForNetworkIdle({ timeout: 3000 });

          await showSubtitle("✅ Homepage loaded, navigating to login...");

          // Find and smooth click the login link
          await context.waitForSelector('a[href="/login"]', {
            visible: true,
            timeout: 5000,
          });

          await context.click('a[href="/login"]');
          await new Promise((resolve) => setTimeout(resolve, 1000));

          await showSubtitle("🔐 Clicking Google Sign-In...");

          // Wait for and click Google Sign-In button
          await context.waitForSelector("#google-signin-button", {
            visible: true,
            timeout: 5000,
          });

          await context.click("#google-signin-button");
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Verify we were redirected to /pg
          const authUrl = context.url();
          assert(
            authUrl.includes("/pg"),
            `Should be redirected to /pg after authentication, but was redirected to ${authUrl}`,
          );

          await showSubtitle("✅ Logged in successfully!");

          // Get the organization ID from the logged-in user
          // This would have been created during the login process
          const orgData = await context.evaluate(() => {
            // Try to get org info from the page or make a GraphQL query
            return fetch("/graphql", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                query: `
                query GetOrgId {
                  currentViewer {
                    ... on CurrentViewerLoggedIn {
                      organization {
                        id
                      }
                    }
                  }
                }
              `,
              }),
            }).then((r) => r.json());
          });

          if (orgData?.data?.currentViewer?.organization?.id) {
            orgId = orgData.data.currentViewer.organization.id;
            logger.info(`Got organization ID: ${orgId}`);
          } else {
            // Fallback to a default for testing
            orgId = "test-org-default";
            logger.warn("Could not get org ID from login, using default");
          }
        });

        await t.step("2. Set up Fastpitch test data", async () => {
          await showSubtitle("📝 Creating test CSV data for Fastpitch...");

          testDataPath = await setupFastpitchData();
          logger.info(`Test data created at: ${testDataPath}`);

          await showSubtitle("✅ Test data ready!");
        });

        await t.step("3. Run Fastpitch generate", async () => {
          await showSubtitle("🎯 Running Fastpitch generate...");

          // Set up environment variables to point to test server
          const originalBfApiKey = getConfigurationVariable("BF_API_KEY");
          const originalOpenRouterKey = getConfigurationVariable(
            "OPENROUTER_API_KEY",
          );
          const originalBfBaseUrl = getConfigurationVariable("BF_BASE_URL");

          // Mock the OpenRouter API
          const restoreFetch = await mockOpenRouterResponse();

          try {
            // Use the org ID from login for the API key
            const apiKey = `bf+${orgId}`;

            // Set test environment variables
            Deno.env.set("BF_API_KEY", apiKey);
            Deno.env.set("OPENROUTER_API_KEY", "test-key");
            // Point to our test server for telemetry
            Deno.env.set("BF_BASE_URL", "http://localhost:8002");

            // Now run the actual fastpitch generate
            // We need to capture the output somehow or mock the BfClient
            // For now, let's use a different approach - directly call with modified BfClient

            // Import and use BfClient directly
            const { BfClient } = await import(
              "@bfmono/packages/bolt-foundry/BfClient.ts"
            );
            const { parse } = await import("@std/csv");

            // Read the CSV
            const csvContent = await Deno.readTextFile(testDataPath!);
            const records = parse(csvContent, {
              skipFirstRow: true,
              columns: [
                "id",
                "title",
                "content",
                "url",
                "published_at",
                "scraped_at",
                "source_id",
                "relevance_score",
              ],
            });

            // Create BfClient with test endpoint and dynamic API key
            const bfClient = BfClient.create({
              apiKey: apiKey,
              collectorEndpoint: "http://localhost:8002/api/telemetry",
            });

            // Load the deck
            const deckPath =
              "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md";
            const deck = await bfClient.readLocalDeck(deckPath);

            // Render the deck with stories
            const completion = deck.render({
              context: {
                stories: JSON.stringify(records, null, 2),
              },
              attributes: {
                date: new Date().toISOString().split("T")[0],
              },
            });

            // Create OpenAI client with BfClient's fetch for telemetry
            const OpenAI = (await import("@openai/openai")).default;
            const openai = new OpenAI({
              apiKey: "test-key",
              baseURL: "https://openrouter.ai/api/v1",
              defaultHeaders: {
                "HTTP-Referer": "https://boltfoundry.com",
                "X-Title": "Bolt Foundry Fastpitch",
              },
              fetch: bfClient.fetch,
            });

            // Call the API (will be intercepted by our mock)
            const response = await openai.chat.completions.create({
              ...completion,
              response_format: { type: "json_object" },
            });

            // Type assertion to handle the union type
            if ("choices" in response) {
              logger.info(
                "Fastpitch completed:",
                response.choices[0].message.content,
              );
            }

            await showSubtitle("✅ Fastpitch telemetry sent!");
          } finally {
            // Restore environment variables
            if (originalBfApiKey) Deno.env.set("BF_API_KEY", originalBfApiKey);
            else Deno.env.delete("BF_API_KEY");

            if (originalOpenRouterKey) {
              Deno.env.set("OPENROUTER_API_KEY", originalOpenRouterKey);
            } else Deno.env.delete("OPENROUTER_API_KEY");

            if (originalBfBaseUrl) {
              Deno.env.set("BF_BASE_URL", originalBfBaseUrl);
            } else Deno.env.delete("BF_BASE_URL");

            // Restore fetch
            restoreFetch();
          }
        });

        await t.step("4. Verify deck appears in dashboard", async () => {
          await showSubtitle("📂 Navigating to decks page...");

          // Navigate to decks page
          await navigateTo(context, "/pg/grade/decks");
          await context.waitForNetworkIdle({ timeout: 3000 });

          // Refresh the page to ensure we get fresh data
          await showSubtitle("🔄 Refreshing to get latest decks...");
          await context.__UNSAFE_page_useContextMethodsInstead.reload();
          await context.waitForNetworkIdle({ timeout: 3000 });

          // Look for Fastpitch deck
          await showSubtitle("🔍 Looking for Fastpitch deck...");

          // First check if we have any decks at all (not the empty state)
          const hasDecks = await context.evaluate(() => {
            const emptyState = document.querySelector('[class*="empty-state"]');
            const noDecksText = document.body.textContent?.includes(
              "No decks yet",
            );
            return !emptyState && !noDecksText;
          });

          if (!hasDecks) {
            await showSubtitle("❌ No decks found - empty state displayed");
            assert(
              false,
              "No decks found in the list - seeing empty state instead",
            );
            return;
          }

          const deckExists = await context.evaluate(() => {
            const deckElements = Array.from(
              document.querySelectorAll(
                '[class*="deck-item"], [class*="list-bar"]',
              ),
            );
            return deckElements.some((el) =>
              el.textContent?.toLowerCase().includes("fastpitch") ||
              el.textContent?.toLowerCase().includes("curator")
            );
          });

          if (deckExists) {
            await showSubtitle("✅ Fastpitch deck found!");

            // Click on the deck to view samples
            const deckClicked = await context.evaluate(() => {
              const deckElements = Array.from(
                document.querySelectorAll(
                  '[class*="deck"], [class*="list-item"]',
                ),
              );
              const fastpitchDeck = deckElements.find((el) =>
                el.textContent?.toLowerCase().includes("fastpitch") ||
                el.textContent?.toLowerCase().includes("curator")
              );
              if (fastpitchDeck) {
                (fastpitchDeck as HTMLElement).click();
                return true;
              }
              return false;
            });

            if (deckClicked) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              await showSubtitle("📊 Viewing Fastpitch samples...");

              // Skip checking for samples for now - we're not onto that yet
              // const hasSamples = await context.page.evaluate(() => {
              //   const sampleElements = document.querySelectorAll(
              //     '[class*="sample"]',
              //   );
              //   return sampleElements.length > 0;
              // });

              // assert(hasSamples, "Should have samples in the deck view");

              // Check if the content shows our stories (not mock data)
              const hasRealContent = await context.evaluate(() => {
                const pageContent = document.body.textContent || "";
                return pageContent.includes("Deno 2.0") ||
                  pageContent.includes("React Server Components") ||
                  pageContent.includes("selected_stories");
              });

              if (hasRealContent) {
                await showSubtitle("✅ Real Fastpitch data is displayed!");
              } else {
                await showSubtitle("⚠️ Content might be mock data");
              }

              await context.takeScreenshot("fastpitch-deck-samples");
            }
          } else {
            await showSubtitle("⚠️ Fastpitch deck not found in list");

            // Try refreshing the page
            await showSubtitle("🔄 Refreshing page...");
            await context.__UNSAFE_page_useContextMethodsInstead.reload();
            await context.waitForNetworkIdle({ timeout: 3000 });

            const deckExistsAfterRefresh = await context.evaluate(() => {
              const deckElements = Array.from(
                document.querySelectorAll(
                  '[class*="deck"], [class*="list-item"]',
                ),
              );
              return deckElements.some((el) =>
                el.textContent?.toLowerCase().includes("fastpitch") ||
                el.textContent?.toLowerCase().includes("curator")
              );
            });

            assert(
              deckExistsAfterRefresh,
              "Fastpitch deck should appear after refresh",
            );
          }
        });

        // Stop video recording
        const videoResult = await stop();
        if (videoResult) {
          logger.debug(`🎬 Video saved: ${videoResult.videoPath}`);
          logger.debug(`📏 Duration: ${videoResult.duration}s`);
        }
      } finally {
        // Clean up test data file if it exists
        if (testDataPath) {
          try {
            await Deno.remove(testDataPath);
          } catch {
            // Ignore cleanup errors
          }
        }

        await teardownE2ETest(context);
      }
    });
  },
});
