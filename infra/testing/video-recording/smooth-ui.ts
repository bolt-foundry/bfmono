import type { Page } from "puppeteer-core";
import { setCursorStyle } from "./cursor-overlay-page-injection.ts";
import type { smoothMoveTo as _smoothMoveTo } from "./smooth-mouse.ts";
import { humanClick, humanMoveTo } from "./human-mouse-puppeteer.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";

/**
 * Smooth UI interaction framework for creating realistic video demos
 * Handles clicking, typing, and other interactions with human-like mouse movements and natural timing
 *
 * Use BF_E2E_SMOOTH=false to disable smooth animations for faster test execution
 * When smooth is enabled, all mouse movements use natural curved paths and human-like timing
 */

// Check if smooth animations are enabled
function isSmoothEnabled(): boolean {
  const smoothConfig = getConfigurationVariable("BF_E2E_SMOOTH");
  // Default to true (smooth enabled) unless explicitly set to false
  return smoothConfig !== "false";
}

export interface ScreenshotOptions {
  before?: string | false; // false to disable, string for custom name, undefined for auto-generated name
  after?: string | false;
  disabled?: boolean; // completely disable all screenshots for this interaction
}

export interface SmoothUIContext {
  page: Page;
  takeScreenshot?: (name: string) => Promise<string>;
}

// Counter for auto-generated screenshot names
let screenshotCounter = 1;

// Helper to take screenshots if available
async function maybeScreenshot(
  context: SmoothUIContext | Page,
  screenshotName: string | false | undefined,
  defaultPrefix: string,
): Promise<void> {
  // Skip if explicitly disabled
  if (screenshotName === false) return;

  // Auto-generate name if not provided
  const name = screenshotName ||
    `${defaultPrefix}-${String(screenshotCounter++).padStart(2, "0")}`;

  if ("takeScreenshot" in context && context.takeScreenshot) {
    await context.takeScreenshot(name);
  }
}

// Script to inject recording throbber on every page
const RECORDING_THROBBER_SCRIPT = `
  (function injectRecordingThrobber() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectRecordingThrobber);
      return;
    }

    // Skip if throbber already exists
    if (document.getElementById("recording-throbber")) {
      return;
    }

    // Always show throbber when this script is injected (during e2e recording)

    // Create throbber element
    const throbber = document.createElement("div");
    throbber.id = "recording-throbber";
    throbber.style.cssText = \`
      position: fixed;
      width: 4px;
      height: 4px;
      background: #ff0000;
      border-radius: 50%;
      z-index: 2147483647;
      animation: recording-pulse 1s infinite;
      pointer-events: none;
      transform: translate(-50%, -50%);
    \`;

    // Create styles
    const style = document.createElement("style");
    style.textContent = \`
      @keyframes recording-pulse {
        0% {
          opacity: 0;
        }
        50% {
          opacity: 0.01;
        }
        100% {
          opacity: 0;
        }
      }
    \`;

    // Append elements
    document.head.appendChild(style);
    document.body.appendChild(throbber);

    // Function to update throbber position based on global mouse position
    function updateThrobberPosition() {
      const throbber = document.getElementById("recording-throbber");
      const mousePos = globalThis.__mousePosition;
      
      if (throbber && mousePos) {
        // Position throbber directly at mouse position
        throbber.style.left = mousePos.x + "px";
        throbber.style.top = mousePos.y + "px";
      }
    }

    // Initial positioning
    updateThrobberPosition();

    // Update position periodically to catch programmatic mouse movements
    // Using a longer interval to reduce jitter
    const positionInterval = setInterval(updateThrobberPosition, 250);

    // Store cleanup function
    globalThis.__cleanupRecordingThrobber = () => {
      clearInterval(positionInterval);
    };
  })();
`;

// Inject recording throbber on all pages (persists across navigation)
export async function injectRecordingThrobberOnAllPages(
  page: Page,
): Promise<void> {
  // Inject the script that will run on every page load
  await page.evaluateOnNewDocument(RECORDING_THROBBER_SCRIPT);

  // Also inject immediately on current page
  await page.evaluate(RECORDING_THROBBER_SCRIPT);
}

// Add recording throbber to keep screencast active during pauses
export async function addRecordingThrobber(page: Page): Promise<void> {
  // Just inject the throbber script
  await page.evaluate(RECORDING_THROBBER_SCRIPT);
}

export async function removeRecordingThrobber(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Clean up event listeners and intervals
    const global = globalThis as unknown as {
      __cleanupRecordingThrobber?: () => void;
    };
    if (global.__cleanupRecordingThrobber) {
      global.__cleanupRecordingThrobber();
      delete global.__cleanupRecordingThrobber;
    }

    const throbber = document.getElementById("recording-throbber");
    if (throbber) throbber.remove();
  });
}

export async function smoothClick(
  context: SmoothUIContext | Page,
  selector: string,
  screenshots?: ScreenshotOptions,
): Promise<void> {
  const page = "page" in context ? context.page : context;
  const smoothEnabled = isSmoothEnabled();

  // Skip all screenshots if disabled
  if (!screenshots?.disabled && smoothEnabled) {
    await maybeScreenshot(context, screenshots?.before, "click-before");
  }

  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  if (smoothEnabled) {
    // Smooth interaction with human-like mouse movement
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Unable to get bounding box for: ${selector}`);
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Always use human-like mouse movement and clicking when smooth is enabled
    await humanClick(page, centerX, centerY);
  } else {
    // Fast mode: direct click without animations
    await element.click();
  }

  if (!screenshots?.disabled && smoothEnabled) {
    await maybeScreenshot(context, screenshots?.after, "click-after");
  }
}

export async function smoothType(
  context: SmoothUIContext | Page,
  selector: string,
  text: string,
  options: {
    charDelay?: number;
    clickFirst?: boolean;
    clearFirst?: boolean;
  } = {},
  screenshots?: ScreenshotOptions,
): Promise<void> {
  const page = "page" in context ? context.page : context;
  const smoothEnabled = isSmoothEnabled();
  const {
    charDelay = 80,
    clickFirst = true,
    clearFirst = false,
  } = options;

  if (!screenshots?.disabled && smoothEnabled) {
    await maybeScreenshot(context, screenshots?.before, "type-before");
  }

  // Click on the element first if requested
  if (clickFirst) {
    await smoothClick(context, selector, { disabled: true }); // Don't double-screenshot
    if (smoothEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (smoothEnabled) {
    // Smooth typing: character by character
    // Clear existing content if requested
    if (clearFirst) {
      await page.focus(selector);
      await page.keyboard.down("Meta"); // Cmd on Mac
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Meta");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Type character by character with natural timing
    for (const char of text) {
      await page.type(selector, char);
      await new Promise((resolve) => setTimeout(resolve, charDelay));
    }
  } else {
    // Fast mode: direct value setting
    await page.evaluate(
      (sel, txt, clear) => {
        const element = document.querySelector(sel) as
          | HTMLInputElement
          | HTMLTextAreaElement;
        if (element) {
          if (clear) element.value = "";
          element.value = txt;
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        }
      },
      selector,
      text,
      clearFirst,
    );
  }

  if (!screenshots?.disabled && smoothEnabled) {
    await maybeScreenshot(context, screenshots?.after, "type-after");
  }
}

export async function smoothClickText(
  context: SmoothUIContext | Page,
  buttonText: string,
  screenshots?: ScreenshotOptions,
): Promise<void> {
  const page = "page" in context ? context.page : context;

  // Find element and add temporary data-testid for smooth clicking
  await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const button = buttons.find((btn) =>
      btn.textContent?.trim() === text ||
      btn.textContent?.includes(text)
    );
    if (button) {
      button.setAttribute("data-temp-testid", "target-button");
    }
  }, buttonText);

  try {
    // Use the framework's smooth click with hover and click indicators
    await smoothClick(
      context,
      '[data-temp-testid="target-button"]',
      screenshots,
    );
  } finally {
    // Clean up the temporary attribute
    await page.evaluate(() => {
      const button = document.querySelector(
        '[data-temp-testid="target-button"]',
      );
      if (button) {
        button.removeAttribute("data-temp-testid");
      }
    });
  }
}

export async function smoothFocus(page: Page, selector: string): Promise<void> {
  const smoothEnabled = isSmoothEnabled();
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  const box = await element.boundingBox();
  if (!box) {
    throw new Error(`Unable to get bounding box for: ${selector}`);
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  if (smoothEnabled) {
    // Always use human-like mouse movement when smooth is enabled
    await humanMoveTo(page, centerX, centerY);

    // Brief pause to let hover state settle and be visible
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Show hover style for focus elements
    try {
      await setCursorStyle(page, "hover");
    } catch {
      // Cursor overlay might not be available
    }
  } else {
    // Fast mode: direct focus without smooth movement
    await page.mouse.move(centerX, centerY);
  }

  await page.focus(selector);

  if (smoothEnabled) {
    // Reset cursor style after focus
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await setCursorStyle(page, "default");
    } catch {
      // Cursor overlay might not be available
    }
  }
}

export async function smoothScroll(
  page: Page,
  direction: "up" | "down",
  amount: number = 300,
): Promise<void> {
  const scrollY = direction === "down" ? amount : -amount;

  // Smooth scroll in small increments
  const steps = 10;
  const stepAmount = scrollY / steps;

  for (let i = 0; i < steps; i++) {
    await page.evaluate((step) => {
      globalThis.scrollBy(0, step);
    }, stepAmount);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export async function smoothWait(duration: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, duration));
}
