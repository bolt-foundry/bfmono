import type { Page } from "puppeteer-core";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

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
          padding: 6px 12px !important;
          flex: 1 !important;
          margin-left: 8px !important;
          color: #3c4043 !important;
          font-size: 14px !important;
          overflow: hidden !important;
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
        `;

        addressBar.appendChild(bfIcon);
        addressBar.appendChild(urlText);
        chrome.appendChild(addressBar);

        document.body.appendChild(chrome);

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
