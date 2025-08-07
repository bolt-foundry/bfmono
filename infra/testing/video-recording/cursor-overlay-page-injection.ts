import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";

const CURSOR_SCRIPT = `
(function() {
  // Function to create and inject cursor
  function createCursor() {
    // Remove existing cursor if any
    const existingCursor = document.getElementById("e2e-cursor-overlay");
    if (existingCursor) {
      existingCursor.remove();
    }

    // Create cursor element
    const cursor = document.createElement("div");
    cursor.id = "e2e-cursor-overlay";
    cursor.style.cssText = \`
      position: fixed !important;
      width: 28px !important;
      height: 28px !important;
      background: rgba(255, 20, 20, 0.95) !important;
      border: 4px solid rgba(255, 255, 255, 1) !important;
      border-radius: 50% !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      transition: all 0.2s ease-out !important;
      box-shadow: 0 0 20px rgba(255, 20, 20, 0.9), 0 0 40px rgba(255, 20, 20, 0.5) !important;
      transform: translate(-50%, -50%) !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    \`;

    // Append to body or html if body doesn't exist yet
    const container = document.body || document.documentElement;
    if (container) {
      container.appendChild(cursor);
    }

    // Store cursor element globally
    window.__e2eCursor = cursor;

    // Initialize cursor in center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    cursor.style.left = centerX + "px";
    cursor.style.top = centerY + "px";

    // Store current mouse position globally
    window.__mousePosition = { x: centerX, y: centerY };

    // E2E Cursor created and positioned
    return cursor;
  }

  // Track mouse position
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
  });

  function updateCursorPosition() {
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
      cursor.style.display = "block";
    }
    // Update global mouse position
    window.__mousePosition = { x: mouseX, y: mouseY };
  }

  // Store functions globally for external access
  window.__recreateCursor = createCursor;
  window.__updateCursorPosition = updateCursorPosition;

  // Create initial cursor
  createCursor();

  // Re-inject cursor periodically to ensure persistence
  const persistenceInterval = setInterval(() => {
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (!cursor || cursor.style.display === "none") {
      // Cursor missing, recreating
      createCursor();
    }
  }, 200); // Check every 200ms for very fast recovery

  // Store interval globally so it persists across page loads
  window.__cursorPersistenceInterval = persistenceInterval;
})();
`;

export async function injectCursorOverlayOnAllPages(page: Page): Promise<void> {
  // Inject cursor script on every page load/navigation
  await page.evaluateOnNewDocument(CURSOR_SCRIPT);

  // Also inject immediately on the current page
  await page.evaluate(CURSOR_SCRIPT);

  // Set up event listeners for page navigation
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      // Small delay to let the page settle, then inject cursor
      setTimeout(async () => {
        try {
          await page.evaluate(CURSOR_SCRIPT);
          // Cursor re-injected after navigation
        } catch (_error) {
          // Failed to re-inject cursor after navigation
        }
      }, 100);
    }
  });
}

export async function updateCursorPosition(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page.evaluate((coords) => {
    // First ensure cursor exists
    if (typeof (globalThis as CursorGlobals).__recreateCursor === "function") {
      (globalThis as CursorGlobals).__recreateCursor!();
    }

    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.style.left = coords.x + "px";
      cursor.style.top = coords.y + "px";
      cursor.style.display = "block";
      // Cursor moved to position
    }
    // Update global mouse position
    (globalThis as CursorGlobals).__mousePosition = {
      x: coords.x,
      y: coords.y,
    };
  }, { x, y });
}

export async function setCursorStyle(
  page: Page,
  style: "default" | "click" | "hover",
): Promise<void> {
  await page.evaluate((cursorStyle) => {
    // First ensure cursor exists
    if (typeof (globalThis as CursorGlobals).__recreateCursor === "function") {
      (globalThis as CursorGlobals).__recreateCursor!();
    }

    const cursor = document.getElementById("e2e-cursor-overlay");
    if (!cursor) return;

    switch (cursorStyle) {
      case "click":
        cursor.style.background = "rgba(0, 255, 0, 0.95)";
        cursor.style.transform = "translate(-50%, -50%) scale(1.4)";
        cursor.style.boxShadow =
          "0 0 25px rgba(0, 255, 0, 0.9), 0 0 50px rgba(0, 255, 0, 0.6)";
        break;
      case "hover":
        cursor.style.background = "rgba(255, 140, 0, 0.9)";
        cursor.style.transform = "translate(-50%, -50%) scale(1.2)";
        cursor.style.boxShadow =
          "0 0 22px rgba(255, 140, 0, 0.8), 0 0 45px rgba(255, 140, 0, 0.5)";
        break;
      default:
        cursor.style.background = "rgba(255, 20, 20, 0.95)";
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursor.style.boxShadow =
          "0 0 20px rgba(255, 20, 20, 0.9), 0 0 40px rgba(255, 20, 20, 0.5)";
        break;
    }
  }, style);
}

export async function ensureCursorVisible(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Force recreate cursor if it doesn't exist
    if (typeof (globalThis as CursorGlobals).__recreateCursor === "function") {
      (globalThis as CursorGlobals).__recreateCursor!();
    }

    // Update position
    if (
      typeof (globalThis as CursorGlobals).__updateCursorPosition === "function"
    ) {
      (globalThis as CursorGlobals).__updateCursorPosition!();
    }
  });
}

export async function showCursor(page: Page): Promise<void> {
  await page.evaluate(() => {
    // First ensure cursor exists
    if (typeof (globalThis as CursorGlobals).__recreateCursor === "function") {
      (globalThis as CursorGlobals).__recreateCursor!();
    }

    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.style.display = "block";
      cursor.style.visibility = "visible";
      cursor.style.opacity = "1";
    }
  });
}

export async function hideCursor(page: Page): Promise<void> {
  await page.evaluate(() => {
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.style.display = "none";
    }
  });
}

export async function removeCursorOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Clear persistence interval
    if ((globalThis as CursorGlobals).__cursorPersistenceInterval) {
      clearInterval((globalThis as CursorGlobals).__cursorPersistenceInterval!);
      delete (globalThis as CursorGlobals).__cursorPersistenceInterval;
    }

    // Remove cursor element
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.remove();
    }

    // Clean up globals
    delete (globalThis as CursorGlobals).__e2eCursor;
    delete (globalThis as CursorGlobals).__mousePosition;
    delete (globalThis as CursorGlobals).__recreateCursor;
    delete (globalThis as CursorGlobals).__updateCursorPosition;

    // Cursor completely removed
  });
}
