import type { Page } from "puppeteer-core";
import { setCursorStyle } from "./cursor-overlay-page-injection.ts";
import { smoothMoveTo } from "./smooth-mouse.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";

/**
 * Smooth UI interaction framework for creating realistic video demos
 * Handles clicking, typing, and other interactions with natural timing and visual feedback
 *
 * Use --smooth=false parameter to disable smooth animations for faster test execution
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

    // Function to attach throbber to cursor
    function attachThrobberToCursor() {
      const cursor = document.getElementById("e2e-cursor-overlay");
      const throbber = document.getElementById("recording-throbber");

      if (cursor && throbber) {
        const cursorRect = cursor.getBoundingClientRect();
        throbber.style.left = cursorRect.left + cursorRect.width / 2 + "px";
        throbber.style.top = cursorRect.top + cursorRect.height / 2 + "px";
      }
    }

    // Attach throbber to cursor position initially
    attachThrobberToCursor();

    // Update throbber position when cursor moves
    const updateThrobberPosition = () => {
      attachThrobberToCursor();
    };

    // Listen for mouse movement to update throbber position
    document.addEventListener("mousemove", updateThrobberPosition);

    // Also update position periodically in case cursor moves programmatically
    const positionInterval = setInterval(updateThrobberPosition, 100);

    // Store cleanup function
    globalThis.__cleanupRecordingThrobber = () => {
      document.removeEventListener("mousemove", updateThrobberPosition);
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
    // Full smooth interaction with animations
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Unable to get bounding box for: ${selector}`);
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await smoothMoveTo(page, centerX, centerY);

    // Pause after movement to let hover state settle
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Show click animation
    try {
      await setCursorStyle(page, "click");
    } catch {
      // Cursor overlay might not be available
    }

    // Brief pause before actual click for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 150));

    await page.mouse.click(centerX, centerY);

    // Pause after click to show the click effect
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Reset cursor style after click
    try {
      await setCursorStyle(page, "default");
    } catch {
      // Cursor overlay might not be available
    }

    // Final pause to let UI state settle after click
    await new Promise((resolve) => setTimeout(resolve, 200));
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

  await smoothMoveTo(page, centerX, centerY);

  // Brief pause to let hover state settle
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Show hover style
  try {
    await setCursorStyle(page, "hover");
  } catch {
    // Cursor overlay might not be available
  }

  await page.focus(selector);

  // Reset cursor style
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await setCursorStyle(page, "default");
  } catch {
    // Cursor overlay might not be available
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
