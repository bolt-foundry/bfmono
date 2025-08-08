import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";

export async function injectPersistentCursorOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
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
      cursor.style.cssText = `
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
      `;

      // Append to body or html if body doesn't exist yet
      const container = document.body || document.documentElement;
      if (container) {
        container.appendChild(cursor);
      }

      // Store cursor element globally
      (globalThis as CursorGlobals).__e2eCursor = cursor;

      // Initialize cursor in center of viewport
      const centerX = globalThis.innerWidth / 2;
      const centerY = globalThis.innerHeight / 2;
      cursor.style.left = centerX + "px";
      cursor.style.top = centerY + "px";

      // Store current mouse position globally
      (globalThis as CursorGlobals).__mousePosition = {
        x: centerX,
        y: centerY,
      };

      // E2E Cursor created and positioned
      return cursor;
    }

    // Create initial cursor
    createCursor();

    // Re-inject cursor periodically to ensure persistence
    setInterval(() => {
      const cursor = document.getElementById("e2e-cursor-overlay");
      if (!cursor || cursor.style.display === "none") {
        // Cursor missing, recreating
        createCursor();
      }
    }, 300); // Check every 300ms for faster recovery

    // Re-inject cursor when DOM changes (navigation, etc.)
    const observer = new MutationObserver((_mutations) => {
      // Immediately check if cursor exists after DOM changes
      const cursor = document.getElementById("e2e-cursor-overlay");
      if (!cursor) {
        // Cursor removed by DOM change, recreating immediately
        createCursor();
      }
    });

    // Observe the entire document
    observer.observe(document, {
      childList: true,
      subtree: true,
    });

    // Store observer globally so we can disconnect it later
    (globalThis as CursorGlobals).__cursorObserver = observer;

    // Also re-inject on page events - with immediate execution
    const reinjectCursor = () => {
      // Page event triggered, ensuring cursor exists
      createCursor();
    };

    document.addEventListener("DOMContentLoaded", reinjectCursor);
    globalThis.addEventListener("load", reinjectCursor);
    document.addEventListener("readystatechange", reinjectCursor);

    // Track mouse position
    let mouseX = globalThis.innerWidth / 2;
    let mouseY = globalThis.innerHeight / 2;

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
      (globalThis as CursorGlobals).__mousePosition = { x: mouseX, y: mouseY };
    }

    // Store the createCursor function globally for manual re-injection
    (globalThis as CursorGlobals).__recreateCursor = createCursor;
    (globalThis as CursorGlobals).__updateCursorPosition = updateCursorPosition;
  });
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

export async function updatePersistentCursorPosition(
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

export async function setPersistentCursorStyle(
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

export async function removePersistentCursorOverlay(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Note: persistence interval cannot be cleared as it's not stored globally

    // Disconnect observer
    if ((globalThis as CursorGlobals).__cursorObserver) {
      (globalThis as CursorGlobals).__cursorObserver!.disconnect();
      delete (globalThis as CursorGlobals).__cursorObserver;
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
