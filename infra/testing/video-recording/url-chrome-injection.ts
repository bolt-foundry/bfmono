import type { Page } from "puppeteer-core";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface GlobalWithUrlChrome {
  __updateUrlChromeStatus?: (
    text: string,
    type?: string,
    duration?: number,
  ) => void;
  __clearUrlChromeStatus?: () => void;
}

export const URL_CHROME_HEIGHT = 40;

const BF_SYMBOL_SVG = `<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlnsXlink="http://www.w3.org/1999/xlink"
  x="0px"
  y="0px"
  viewBox="0 0 73 72"
  xmlSpace="preserve"
  style="height: 20px; width: 20px;"
>
  <g>
    <path
      fill="#666"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M42.1462 0.509311V30.288H57.5567L32.9404 71.6886C33.9686 71.7764 35.0091 71.8211 36.0601 71.8211C55.9755 71.8211 72.1202 55.7434 72.1202 35.9106C72.1202 18.1434 59.1635 3.38984 42.1462 0.509311ZM40.8091 0.308638L14.9998 43.7157H30.4103V71.3829C13.1787 68.6827 0 53.8293 0 35.9106C0 16.0777 16.1447 0 36.0601 0C37.6699 0 39.2551 0.105049 40.8091 0.308638Z"
    />
  </g>
</svg>`;

export async function injectUrlChromeOnAllPages(page: Page): Promise<void> {
  try {
    await page.evaluateOnNewDocument((svgContent) => {
      const chromeHeight = 40;

      function createUrlChrome() {
        if (document.getElementById("video-url-chrome")) {
          return;
        }

        const chrome = document.createElement("div");
        chrome.id = "video-url-chrome";
        chrome.style.cssText = `
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: ${chromeHeight}px !important;
          background: #f1f3f4 !important;
          border-top: 1px solid #dadce0 !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 12px !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 14px !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          box-sizing: border-box !important;
        `;

        const addressBar = document.createElement("div");
        addressBar.style.cssText = `
          display: flex !important;
          align-items: center !important;
          background: white !important;
          border: 1px solid #dadce0 !important;
          border-radius: 20px !important;
          padding: 6px 8px !important;
          flex: 1 !important;
          margin-left: 4px !important;
          color: #3c4043 !important;
          font-size: 14px !important;
        `;

        const bfIcon = document.createElement("div");
        bfIcon.innerHTML = svgContent;
        bfIcon.style.cssText = `
          margin-right: 12px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
        `;

        const urlText = document.createElement("span");
        urlText.textContent = globalThis.location.href;
        urlText.style.cssText = `
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          color: #3c4043 !important;
          flex: 1 !important;
        `;

        // Create status display area inside the address bar
        const statusArea = document.createElement("div");
        statusArea.id = "video-url-chrome-status";
        statusArea.style.cssText = `
          display: none !important;
          align-items: center !important;
          margin-left: 12px !important;
          margin-top: -2px !important;
          margin-bottom: -2px !important;
          margin-right: -3px !important;
          padding: 4px 8px !important;
          background: #f8f9fa !important;
          border: 1px solid #dadce0 !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          color: #3c4043 !important;
          flex-shrink: 0 !important;
          transition: opacity 0.3s ease-in-out !important;
          pointer-events: none !important;
        `;

        const statusDot = document.createElement("div");
        statusDot.id = "video-url-chrome-status-dot";
        statusDot.style.cssText = `
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          margin-right: 6px !important;
          flex-shrink: 0 !important;
          background: #34a853 !important;
        `;

        const statusText = document.createElement("span");
        statusText.id = "video-url-chrome-status-text";
        statusText.style.cssText = `
          white-space: nowrap !important;
        `;

        statusArea.appendChild(statusDot);
        statusArea.appendChild(statusText);

        // Add components to address bar in order: icon, url, status
        addressBar.appendChild(bfIcon);
        addressBar.appendChild(urlText);
        addressBar.appendChild(statusArea);

        chrome.appendChild(addressBar);

        document.body.appendChild(chrome);

        // Global timeout ID for auto-clearing status
        let statusTimeoutId: number | null = null;

        // Global function to update status
        (globalThis as GlobalWithUrlChrome).__updateUrlChromeStatus = function (
          text: string,
          type: string = "info",
          duration?: number,
        ) {
          const statusArea = document.getElementById("video-url-chrome-status");
          const statusDot = document.getElementById(
            "video-url-chrome-status-dot",
          );
          const statusText = document.getElementById(
            "video-url-chrome-status-text",
          );

          if (!statusArea || !statusDot || !statusText) return;

          // Clear any existing timeout
          if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
            statusTimeoutId = null;
          }

          // Color mapping for status types
          const colors = {
            error: "#ea4335",
            warning: "#fbbc04",
            info: "#4285f4",
            success: "#34a853",
          };

          statusText.textContent = text;
          statusDot.style.background = colors[type as keyof typeof colors] ||
            colors.info;

          if (text) {
            statusArea.style.display = "flex";
            statusArea.style.opacity = "1";

            // Set auto-clear timeout if duration is provided
            if (duration && duration > 0) {
              statusTimeoutId = setTimeout(() => {
                statusArea.style.display = "none";
                statusTimeoutId = null;
              }, duration);
            }
          } else {
            statusArea.style.display = "none";
          }
        };

        // Global function to clear status
        (globalThis as GlobalWithUrlChrome).__clearUrlChromeStatus =
          function () {
            const statusArea = document.getElementById(
              "video-url-chrome-status",
            );

            // Clear any pending timeout
            if (statusTimeoutId) {
              clearTimeout(statusTimeoutId);
              statusTimeoutId = null;
            }

            if (statusArea) {
              statusArea.style.display = "none";
            }
          };

        const updateUrl = () => {
          urlText.textContent = globalThis.location.href;
        };

        globalThis.addEventListener("popstate", updateUrl);
        globalThis.addEventListener("pushstate", updateUrl);
        globalThis.addEventListener("replacestate", updateUrl);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
          originalPushState.apply(history, args);
          setTimeout(updateUrl, 0);
        };

        history.replaceState = function (...args) {
          originalReplaceState.apply(history, args);
          setTimeout(updateUrl, 0);
        };
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createUrlChrome);
      } else {
        createUrlChrome();
      }
    }, BF_SYMBOL_SVG);

    logger.debug("URL chrome injection script added to all new pages");
  } catch (error) {
    logger.error("Failed to inject URL chrome on new pages:", error);
    throw error;
  }
}

export async function updateUrlChromeStatus(
  page: Page,
  text: string,
  type: "error" | "warning" | "info" | "success" = "info",
  duration?: number,
): Promise<void> {
  try {
    await page.evaluate(
      (statusText, statusType, autoClearDuration) => {
        interface GlobalWithUrlChrome {
          __updateUrlChromeStatus?: (
            text: string,
            type?: string,
            duration?: number,
          ) => void;
        }
        if (
          typeof (globalThis as GlobalWithUrlChrome).__updateUrlChromeStatus ===
            "function"
        ) {
          (globalThis as GlobalWithUrlChrome).__updateUrlChromeStatus!(
            statusText,
            statusType,
            autoClearDuration,
          );
        }
      },
      text,
      type,
      duration,
    );
    logger.debug(
      `URL chrome status updated: ${type} - ${text}${
        duration ? ` (auto-clear: ${duration}ms)` : ""
      }`,
    );
  } catch (error) {
    logger.warn("Failed to update URL chrome status:", error);
  }
}

export async function clearUrlChromeStatus(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      interface GlobalWithUrlChrome {
        __clearUrlChromeStatus?: () => void;
      }
      if (
        typeof (globalThis as GlobalWithUrlChrome).__clearUrlChromeStatus ===
          "function"
      ) {
        (globalThis as GlobalWithUrlChrome).__clearUrlChromeStatus!();
      }
    });
    logger.debug("URL chrome status cleared");
  } catch (error) {
    logger.warn("Failed to clear URL chrome status:", error);
  }
}

export async function removeUrlChrome(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      const chrome = document.getElementById("video-url-chrome");
      if (chrome) {
        chrome.remove();
      }
    });
    logger.debug("URL chrome removed from page");
  } catch (error) {
    logger.warn("Failed to remove URL chrome:", error);
  }
}
