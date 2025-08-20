import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import {
  type Browser,
  type HTTPResponse as Response,
  launch,
  type Page,
} from "puppeteer-core";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { ensureDir } from "@std/fs";
import { basename, join } from "@std/path";
import {
  injectRecordingThrobberOnAllPages,
  removeRecordingThrobber,
  smoothClick,
  smoothScroll,
  smoothType,
} from "../video-recording/smooth-ui.ts";
import { smoothHover } from "../video-recording/smooth-mouse.ts";
import {
  _startScreencastRecordingInternal,
  _stopScreencastRecordingInternal,
  type VideoRecordingSession as _VideoRecordingSession,
} from "../video-recording/recorder.ts";
import type {
  VideoConversionOptions,
  VideoConversionResult,
} from "../video-recording/video-converter.ts";
import {
  injectCursorOverlayOnAllPages,
  removeCursorOverlay,
} from "../video-recording/cursor-overlay-page-injection.ts";

const logger = getLogger(import.meta);

export interface VideoRecordingControls {
  stop: () => Promise<VideoConversionResult | null>;
  showSubtitle: (text: string) => Promise<void>;
  highlightElement: (selector: string, text: string) => Promise<void>;
}

// Simple server startup without global registry - each test gets its own server

/**
 * Checks if a server is already running on the given port
 */
async function _isServerRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      method: "HEAD",
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Detects if the current environment is a CI environment
 */
function _isCI(): boolean {
  // Check if this is Replit - Replit has display server and should not be treated as CI
  if (
    getConfigurationVariable("REPL_ID") ||
    getConfigurationVariable("REPL_SLUG") ||
    getConfigurationVariable("REPLIT_DB_URL")
  ) {
    logger.info(
      "Detected Replit environment - treating as non-CI for E2E tests",
    );
    return false;
  }

  // Check for Bolt Foundry specific CI flag first
  const bfCI = getConfigurationVariable("BF_CI");
  if (bfCI === "true") return true;

  // Check for common CI environment variables
  const ciVars = [
    "CI",
    "CONTINUOUS_INTEGRATION",
    "GITHUB_ACTIONS",
    "GITLAB_CI",
    "JENKINS_HOME",
    "JENKINS_URL",
    "CIRCLECI",
    "TRAVIS",
    "BUILDKITE",
    "DRONE",
    "TEAMCITY_VERSION",
    "TF_BUILD", // Azure DevOps
    "BITBUCKET_BUILD_NUMBER",
    "SEMAPHORE",
    "APPVEYOR",
    "CODEBUILD_BUILD_ID", // AWS CodeBuild
  ];

  return ciVars.some((varName) => {
    const value = getConfigurationVariable(varName);
    return value === "true" || value === "1";
  });
}

export interface E2ETestContext {
  browser: Browser;
  __UNSAFE_page_useContextMethodsInstead: Page;
  baseUrl: string;
  takeScreenshot: (
    name: string,
    options?: { fullPage?: boolean; showAnnotations?: boolean },
  ) => Promise<string>;
  navigateTo: (path: string) => Promise<void>;
  startRecording: (
    name: string,
  ) => Promise<VideoRecordingControls>;
  teardown: () => Promise<void>;
  // Smooth interaction methods (preferred for E2E tests)
  click: (selector: string) => Promise<void>;
  type: (selector: string, text: string, options?: {
    clearFirst?: boolean;
    clickFirst?: boolean;
  }) => Promise<void>;
  hover: (selector: string) => Promise<void>;
  scroll: (direction: "up" | "down") => Promise<void>;
  waitForSelector: (
    selector: string,
    options?: { timeout?: number; visible?: boolean },
  ) => Promise<void>;
  evaluate: <T>(
    // deno-lint-ignore no-explicit-any
    fn: (...args: Array<any>) => T,
    // deno-lint-ignore no-explicit-any
    ...args: Array<any>
  ) => Promise<T>;
  url: () => string;
  title: () => Promise<string>;
  waitForNetworkIdle: (options?: {
    timeout?: number;
    idleTime?: number;
  }) => Promise<void>;
  navigate: (url: string, options?: {
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
    timeout?: number;
  }) => Promise<Response | null>;
  waitForFunction: <T = unknown>(
    fn: () => T | Promise<T>,
    options?: { timeout?: number; polling?: number | "raf" | "mutation" },
  ) => Promise<void>;
}

/**
 * Sets up the e2e test environment
 */
export async function setupE2ETest(options: {
  baseUrl?: string;
  server?: string;
} = {}): Promise<E2ETestContext> {
  let baseUrl = options.baseUrl;

  // Always require servers to be pre-started by bft e2e
  if (options.server) {
    throw new Error(
      `Server startup requested but setup.ts no longer handles server management. ` +
        `Please run tests through 'bft e2e' which will start required servers automatically ` +
        `based on the server registry. Server requested: ${options.server}`,
    );
  }

  // Fallback to environment variable if no server started and no baseUrl provided
  if (!baseUrl) {
    baseUrl = getConfigurationVariable("BF_E2E_BASE_URL") ||
      "http://localhost:8000";
  }

  // Run in headless mode by default for consistency and performance
  // Only show browser when explicitly requested via BF_E2E_SHOW_BROWSER environment variable
  let headless: boolean;
  const showBrowserEnv = getConfigurationVariable("BF_E2E_SHOW_BROWSER");
  if (showBrowserEnv !== undefined) {
    headless = showBrowserEnv !== "true";
  } else {
    // Always default to headless for automated testing
    headless = true;
  }

  logger.info(
    `Starting e2e test with baseUrl: ${baseUrl}, headless: ${headless}`,
  );

  if (!headless) {
    logger.warn(
      "Running in non-headless mode - video recordings may have inconsistent dimensions due to browser UI (address bar, toolbars). " +
        "For consistent video dimensions, set BF_E2E_SHOW_BROWSER=false or run in headless mode.",
    );
  }

  try {
    // Find the browser executable path
    let chromiumPath = "chromium";

    // First check for environment variable
    const envPath = getConfigurationVariable("PUPPETEER_EXECUTABLE_PATH");
    if (envPath) {
      chromiumPath = envPath;
      logger.info(
        `Using browser from PUPPETEER_EXECUTABLE_PATH: ${chromiumPath}`,
      );
    } else {
      // Try chromium first, then chrome - check both PATH and known locations
      const browsersToCheck = [
        // Check PATH first
        { name: "chromium", checkType: "which" },
        { name: "google-chrome", checkType: "which" },
        { name: "google-chrome-stable", checkType: "which" },
        // Check macOS application paths
        {
          name: "Chromium",
          checkType: "path",
          path: "/Applications/Chromium.app/Contents/MacOS/Chromium",
        },
        {
          name: "Google Chrome",
          checkType: "path",
          path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
      ];

      for (const browser of browsersToCheck) {
        try {
          if (browser.checkType === "which") {
            const command = new Deno.Command("which", {
              args: [browser.name],
              stdout: "piped",
            });
            const output = await command.output();
            if (output.success) {
              const path = new TextDecoder().decode(output.stdout).trim();
              if (path) {
                chromiumPath = path;
                logger.info(`Found ${browser.name} at: ${chromiumPath}`);
                break;
              }
            }
          } else if (browser.checkType === "path" && browser.path) {
            const stat = await Deno.stat(browser.path);
            if (stat.isFile) {
              chromiumPath = browser.path;
              logger.info(`Found ${browser.name} at: ${chromiumPath}`);
              break;
            }
          }
        } catch {
          // Try next browser
        }
      }

      if (chromiumPath === "chromium") {
        logger.warn(
          "No Chromium or Chrome found. Please install one or set PUPPETEER_EXECUTABLE_PATH",
        );
      }
    }

    // Ensure screenshots directory exists, using environment variable if available
    const runSpecificDir = getConfigurationVariable("BF_E2E_SCREENSHOT_DIR");
    const screenshotsDir = runSpecificDir ||
      join(Deno.cwd(), "tmp", "screenshots");
    await ensureDir(screenshotsDir);
    logger.info(`Screenshots will be saved to: ${screenshotsDir}`);

    // Set up latest directory for stable artifact location
    const latestDir = getConfigurationVariable("BF_E2E_LATEST_DIR");
    if (latestDir) {
      await ensureDir(latestDir);
      logger.info(`Latest test artifacts will be copied to: ${latestDir}`);
    }

    // Launch browser using puppeteer-core
    const browser = await launch({
      headless,
      executablePath: chromiumPath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Critical for Docker - use /tmp instead of /dev/shm
        "--disable-gpu", // Disable GPU hardware acceleration in containers
        "--disable-software-rasterizer",
        "--window-size=1280,720",
      ],
      defaultViewport: { width: 1280, height: 720 },
      dumpio: false, // Don't dump Chrome's stdio to prevent resource leaks
    });

    // Unref the browser process to prevent it from keeping the event loop alive
    try {
      const processMethod =
        (browser as { process?: () => { unref?: () => void } })
          .process;
      if (processMethod) {
        const process = processMethod();
        if (process && process.unref) {
          process.unref();
          logger.debug("Browser process unref'd to prevent resource leaks");
        }
      }
    } catch (error) {
      logger.debug("Could not unref browser process:", error);
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    page.on("console", (msg) => {
      const line = `[browser ${msg.type()}] ${msg.text()}`;
      // choose ONE of these:
      logger.info(line); // if you have a structured logger
      // console.log(line); // or plain stdout for Deno test runner

      // optional: dump objects the page logs
      for (const arg of msg.args()) {
        arg.jsonValue()
          .then((v) => logger.debug(v))
          .catch(() => {/* circular/remote handles */});
      }
    });

    // Create screenshot function
    const takeScreenshot = async (
      name: string,
      options?: { fullPage?: boolean; showAnnotations?: boolean },
    ): Promise<string> => {
      const fileName = `${Date.now()}_${name.replace(/\s+/g, "-")}.png`;
      const filePath = join(screenshotsDir, fileName) as `${string}.png`;

      try {
        // Hide annotations by default (showAnnotations defaults to false)
        const showAnnotations = options?.showAnnotations ?? false;

        if (!showAnnotations) {
          // Hide all e2e annotations for clean screenshot
          await page.evaluate(() => {
            const subtitle = document.getElementById("e2e-subtitle");
            const highlights = document.querySelectorAll(".e2e-highlight");

            if (subtitle) subtitle.style.display = "none";
            highlights.forEach((highlight) => {
              (highlight as HTMLElement).style.display = "none";
            });
          });
        }

        await page.screenshot({
          path: filePath,
          fullPage: options?.fullPage ?? false,
        });

        if (!showAnnotations) {
          // Restore annotations after screenshot
          await page.evaluate(() => {
            const subtitle = document.getElementById("e2e-subtitle");
            const highlights = document.querySelectorAll(".e2e-highlight");

            if (subtitle) subtitle.style.display = "";
            highlights.forEach((highlight) => {
              (highlight as HTMLElement).style.display = "";
            });
          });
        }

        logger.info(
          `Screenshot saved to: ${filePath}${
            showAnnotations ? " (with annotations)" : " (clean)"
          }`,
        );

        // Copy to latest directory if configured
        if (latestDir) {
          try {
            const latestPath = join(
              latestDir,
              `${name.replace(/\s+/g, "-")}.png`,
            );
            await Deno.copyFile(filePath, latestPath);
            logger.debug(`Screenshot copied to latest: ${latestPath}`);
          } catch (error) {
            logger.warn(
              `Failed to copy screenshot to latest: ${
                (error as Error).message
              }`,
            );
          }
        }

        return filePath;
      } catch (error) {
        logger.error(`Failed to take screenshot: ${(error as Error).message}`);
        return "";
      }
    };

    // Create context methods
    const context: E2ETestContext = {
      browser,
      __UNSAFE_page_useContextMethodsInstead: page,
      baseUrl,
      takeScreenshot,
      navigateTo: async (path: string): Promise<void> => {
        const url = new URL(path, baseUrl).toString();
        logger.info(`Navigating to ${url}`);
        await page.goto(url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Note: both cursor overlay and recording throbber are automatically
        // re-injected after navigation using evaluateOnNewDocument
      },
      startRecording: async (
        name: string,
      ): Promise<VideoRecordingControls> => {
        // Check if video recording is disabled
        if (getConfigurationVariable("BF_E2E_NO_VIDEO") === "true") {
          logger.debug("Video recording disabled by BF_E2E_NO_VIDEO");
          // Return no-op controls
          return {
            stop: () => Promise.resolve(null),
            showSubtitle: async () => {},
            highlightElement: async () => {},
          };
        }

        const videosDir = getConfigurationVariable("BF_E2E_VIDEO_DIR") ||
          join(Deno.cwd(), "tmp", "videos");

        // Get video configuration from environment variables
        const videoOptions: VideoConversionOptions = {
          outputFormat:
            (getConfigurationVariable("BF_E2E_VIDEO_FORMAT") || "mp4") as
              | "mp4"
              | "webm"
              | "gif",
          quality:
            (getConfigurationVariable("BF_E2E_VIDEO_QUALITY") || "medium") as
              | "low"
              | "medium"
              | "high",
          framerate: parseInt(
            getConfigurationVariable("BF_E2E_VIDEO_FPS") || "48",
            10,
          ),
          deleteFrames: true,
        };

        // Ensure videos directory exists
        await ensureDir(videosDir);

        // Inject cursor overlay for better video visibility
        try {
          await injectCursorOverlayOnAllPages(page);
          logger.debug(
            "Cursor overlay injected for video recording with auto-persistence",
          );
        } catch (error) {
          logger.warn("Failed to inject cursor overlay:", error);
        }

        const session = await _startScreencastRecordingInternal(
          page,
          name,
          videosDir,
        );

        // Inject throbber on all pages to persist across navigations
        await injectRecordingThrobberOnAllPages(page);

        return {
          stop: async (): Promise<VideoConversionResult | null> => {
            try {
              // Stop throbber before stopping recording
              await removeRecordingThrobber(page);

              const videoResult = await _stopScreencastRecordingInternal(
                page,
                session,
                videoOptions,
              );

              // Clean up cursor overlay
              try {
                await removeCursorOverlay(page);
              } catch (error) {
                logger.debug("Failed to remove cursor overlay:", error);
              }

              logger.info(
                `Video recording completed: ${videoResult.videoPath} (${videoResult.fileSize} bytes)`,
              );

              // Copy to latest directory if configured
              if (latestDir) {
                try {
                  const videoFilename = basename(videoResult.videoPath);
                  // Use a stable name for the latest video
                  const testNameClean = name.replace(/\s+/g, "-");
                  const extension = videoFilename.substring(
                    videoFilename.lastIndexOf("."),
                  );
                  const latestVideoPath = join(
                    latestDir,
                    `${testNameClean}${extension}`,
                  );
                  await Deno.copyFile(videoResult.videoPath, latestVideoPath);
                  logger.info(`Video copied to latest: ${latestVideoPath}`);
                } catch (error) {
                  logger.warn(
                    `Failed to copy video to latest: ${
                      (error as Error).message
                    }`,
                  );
                }
              }

              return videoResult;
            } catch (error) {
              logger.error(
                `Failed to stop video recording: ${(error as Error).message}`,
              );
              return null;
            }
          },
          showSubtitle: async (text: string): Promise<void> => {
            await page.evaluate((subtitleText) => {
              // Get or create E2E overlay container
              let container = document.getElementById("e2e-overlay-container");
              if (!container) {
                container = document.createElement("div");
                container.id = "e2e-overlay-container";
                container.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  pointer-events: none;
                  z-index: 2147483647;
                `;
                document.body.appendChild(container);
              }

              // Remove existing subtitle if present
              const existing = document.getElementById("e2e-subtitle");
              if (existing) existing.remove();

              // Create subtitle element
              const subtitle = document.createElement("div");
              subtitle.id = "e2e-subtitle";
              subtitle.textContent = subtitleText;
              subtitle.style.cssText = `
                position: fixed;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 500;
                z-index: 5;
                pointer-events: none;
                max-width: 80vw;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
              `;

              container.appendChild(subtitle);

              // Trigger animation
              requestAnimationFrame(() => {
                subtitle.style.opacity = "1";
                subtitle.style.transform = "translateX(-50%) translateY(0)";
              });
            }, text);

            logger.info(`Subtitle displayed: "${text}"`);
          },
          highlightElement: async (
            selector: string,
            text: string,
          ): Promise<void> => {
            // Check if element exists before highlighting
            const elementExists = await page.evaluate((elementSelector) => {
              return !!document.querySelector(elementSelector);
            }, selector);

            if (!elementExists) {
              logger.warn(`Element not found for highlighting: ${selector}`);
              return;
            }

            await page.evaluate(
              (elementSelector, annotationText) => {
                // Find the target element
                const element = document.querySelector(elementSelector);
                if (!element) {
                  return;
                }

                // Get or create E2E overlay container
                let container = document.getElementById(
                  "e2e-overlay-container",
                );
                if (!container) {
                  container = document.createElement("div");
                  container.id = "e2e-overlay-container";
                  container.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2147483647;
                  `;
                  document.body.appendChild(container);
                }

                // Remove existing highlights
                document.querySelectorAll(".e2e-highlight").forEach((h) =>
                  h.remove()
                );

                // Get element position
                const rect = element.getBoundingClientRect();

                // Create highlight overlay
                const highlight = document.createElement("div");
                highlight.className = "e2e-highlight";
                highlight.style.cssText = `
                position: fixed;
                left: ${rect.left - 4}px;
                top: ${rect.top - 4}px;
                width: ${rect.width + 8}px;
                height: ${rect.height + 8}px;
                border: 3px solid #ff6b35;
                border-radius: 8px;
                z-index: 20;
                pointer-events: none;
                box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
                animation: highlight-pulse 2s ease-in-out infinite;
              `;

                // Create annotation text
                const annotation = document.createElement("div");
                annotation.className = "e2e-highlight";
                annotation.textContent = annotationText;
                annotation.style.cssText = `
                position: fixed;
                left: ${rect.left}px;
                top: ${rect.top - 45}px;
                background: #ff6b35;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 500;
                z-index: 25;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transform: translateY(10px);
                opacity: 0;
                transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
              `;

                // Add CSS keyframes for pulse animation
                if (!document.getElementById("e2e-highlight-styles")) {
                  const style = document.createElement("style");
                  style.id = "e2e-highlight-styles";
                  style.textContent = `
                  @keyframes highlight-pulse {
                    0%, 100% { 
                      opacity: 1;
                      transform: scale(1);
                    }
                    50% { 
                      opacity: 0.7;
                      transform: scale(1.02);
                    }
                  }
                `;
                  document.head.appendChild(style);
                }

                container.appendChild(highlight);
                container.appendChild(annotation);

                // Trigger annotation animation
                requestAnimationFrame(() => {
                  annotation.style.opacity = "1";
                  annotation.style.transform = "translateY(0)";
                });
              },
              selector,
              text,
            );

            logger.info(
              `Element highlighted: "${selector}" with text: "${text}"`,
            );
          },
        };
      },
      // Smooth interaction methods (preferred for E2E tests)
      click: async (selector: string): Promise<void> => {
        await smoothClick({ page, takeScreenshot }, selector);
      },
      type: async (
        selector: string,
        text: string,
        options?: { clearFirst?: boolean; clickFirst?: boolean },
      ): Promise<void> => {
        await smoothType(
          { page, takeScreenshot },
          selector,
          text,
          options,
        );
      },
      hover: async (selector: string): Promise<void> => {
        await smoothHover(page, selector);
      },
      scroll: async (direction: "up" | "down"): Promise<void> => {
        await smoothScroll(page, direction);
      },
      waitForSelector: async (
        selector: string,
        options?: { timeout?: number; visible?: boolean },
      ): Promise<void> => {
        await page.waitForSelector(selector, options);
      },
      evaluate: async <T>(
        // deno-lint-ignore no-explicit-any
        fn: (...args: Array<any>) => T,
        // deno-lint-ignore no-explicit-any
        ...args: Array<any>
      ): Promise<T> => {
        return await page.evaluate(fn, ...args);
      },
      url: (): string => {
        return page.url();
      },
      title: async (): Promise<string> => {
        return await page.title();
      },
      waitForNetworkIdle: async (options?: {
        timeout?: number;
        idleTime?: number;
      }): Promise<void> => {
        await page.waitForNetworkIdle(options);
      },
      navigate: async (url: string, options?: {
        waitUntil?:
          | "load"
          | "domcontentloaded"
          | "networkidle0"
          | "networkidle2";
        timeout?: number;
      }): Promise<Response | null> => {
        return await page.goto(url, options);
      },
      waitForFunction: async <T = unknown>(
        fn: () => T | Promise<T>,
        options?: { timeout?: number; polling?: number | "raf" | "mutation" },
      ): Promise<void> => {
        await page.waitForFunction(fn, options);
      },
      teardown: async (): Promise<void> => {
        try {
          // First close any open pages
          if (page && !page.isClosed()) {
            await page.close();
          }

          // Then close the browser completely
          if (browser) {
            await browser.close();
          }

          // Give time for all resources to be released
          await new Promise((resolve) => setTimeout(resolve, 100));

          logger.info("E2E test environment torn down (browser only)");
        } catch (error) {
          logger.error("Error during teardown:", error);
          throw error;
        }
      },
    };

    return context;
  } catch (error) {
    logger.error("Failed to setup e2e test:", error);
    throw error;
  }
}

/**
 * Tears down the e2e test environment
 */
export async function teardownE2ETest(context: E2ETestContext): Promise<void> {
  try {
    // First close any open pages
    const page = context.__UNSAFE_page_useContextMethodsInstead;
    if (page && !page.isClosed()) {
      await page.close();
    }

    // Then close the browser completely
    if (context.browser) {
      await context.browser.close();
    }

    // Give time for all resources to be released
    await new Promise((resolve) => setTimeout(resolve, 100));

    logger.info("E2E test environment torn down (browser only)");
  } catch (error) {
    logger.error("Error during teardown:", error);
  }
}

/**
 * Helper for navigation and waiting for page load
 */
export async function navigateTo(
  context: E2ETestContext,
  path: string,
): Promise<void> {
  // Just delegate to the context method which handles cursor overlay re-injection
  await context.navigateTo(path);
}
