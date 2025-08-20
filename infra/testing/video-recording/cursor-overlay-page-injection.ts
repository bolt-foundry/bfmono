import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";

const CURSOR_SCRIPT = `
(function() {
  // Cursor trail configuration - visible motion blur
  const TRAIL_LENGTH = 3; // Three elements for visible blur
  const TRAIL_FADE_SPEED = 0.2; // Slower fade for more visibility
  
  // Function to create and inject cursor with trail
  function createCursor() {
    // Remove existing cursors if any
    const existingCursors = document.querySelectorAll("[id^='e2e-cursor-']");
    existingCursors.forEach(cursor => cursor.remove());

    // Create main cursor element
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
      z-index: 2147483646 !important;
      transition: none !important;
      box-shadow: 0 0 20px rgba(255, 20, 20, 0.9), 0 0 40px rgba(255, 20, 20, 0.5) !important;
      transform: translate(-50%, -50%) !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    \`;

    // Create trail elements with same size as main cursor for true motion blur
    const trailElements = [];
    const CURSOR_SIZE = 28; // Same size as main cursor
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const trailElement = document.createElement("div");
      trailElement.id = \`e2e-cursor-trail-\${i}\`;
      const opacity = 1 - (i + 1) * TRAIL_FADE_SPEED;
      
      trailElement.style.cssText = \`
        position: fixed !important;
        width: \${CURSOR_SIZE}px !important;
        height: \${CURSOR_SIZE}px !important;
        background: rgba(255, 20, 20, \${opacity * 0.6}) !important;
        border: 4px solid rgba(255, 255, 255, \${opacity * 0.8}) !important;
        border-radius: 50% !important;
        pointer-events: none !important;
        z-index: \${2147483641 + i} !important;
        transition: none !important;
        box-shadow: 0 0 20px rgba(255, 20, 20, \${opacity * 0.5}) !important;
        transform: translate(-50%, -50%) !important;
        display: block !important;
        visibility: visible !important;
        opacity: \${opacity} !important;
      \`;
      
      trailElements.push(trailElement);
    }

    // Append to body or html if body doesn't exist yet
    const container = document.body || document.documentElement;
    if (container) {
      container.appendChild(cursor);
      trailElements.forEach(element => container.appendChild(element));
    }

    // Store cursor elements globally
    window.__e2eCursor = cursor;
    window.__e2eCursorTrail = trailElements;
    
    // Initialize cursor at last known position or center of viewport
    const lastPosition = window.__mousePosition || { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    cursor.style.left = lastPosition.x + "px";
    cursor.style.top = lastPosition.y + "px";

    // No need for position history array with interpolation approach
    
    // Position all trail elements at start position
    trailElements.forEach((element, i) => {
      element.style.left = lastPosition.x + "px";
      element.style.top = lastPosition.y + "px";
      element.style.display = "block";
      element.style.visibility = "visible";
    });

    // Store current mouse position globally if not already stored
    if (!window.__mousePosition) {
      window.__mousePosition = { x: lastPosition.x, y: lastPosition.y };
    }

    // E2E Cursor with trail created and positioned
    return cursor;
  }

  // Track mouse position - use last known position or center
  let mouseX = window.__mousePosition ? window.__mousePosition.x : window.innerWidth / 2;
  let mouseY = window.__mousePosition ? window.__mousePosition.y : window.innerHeight / 2;

  // Use requestAnimationFrame for smoother updates
  let animationFrameId = null;
  
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Cancel any pending animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Schedule update on next animation frame for smoother rendering
    animationFrameId = requestAnimationFrame(() => {
      updateCursorPosition();
      animationFrameId = null;
    });
  });

  function updateCursorPosition() {
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (cursor) {
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
      cursor.style.display = "block";
    }
    
    // Update trail positions using previous frame interpolation
    if (window.__e2eCursorTrail) {
      // Get previous position from dedicated previous storage
      const prevX = window.__mousePrevious ? window.__mousePrevious.x : mouseX;
      const prevY = window.__mousePrevious ? window.__mousePrevious.y : mouseY;
      const currentX = mouseX;
      const currentY = mouseY;
      
      // Calculate the movement vector from previous to current position
      const deltaX = currentX - prevX;
      const deltaY = currentY - prevY;
      
      // Calculate movement distance
      const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const MOVEMENT_THRESHOLD = 2; // Only show trails if movement is > 2 pixels
      
      // Get the main cursor's current transform scale to match trail sizes
      const mainCursor = window.__e2eCursor;
      let currentScale = "1";
      if (mainCursor) {
        const transform = mainCursor.style.transform;
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
          currentScale = scaleMatch[1];
        }
      }
      
      // Debug: Log the current scale to see what's happening
      if (Math.random() < 0.01) { // Occasional logging
        console.log('Main cursor transform:', mainCursor?.style.transform, 'Extracted scale:', currentScale);
      }
      
      window.__e2eCursorTrail.forEach((trailElement, i) => {
        if (trailElement) {
          if (movementDistance > MOVEMENT_THRESHOLD) {
            // Interpolate positions between previous and current frame
            // Trail 0 = 75% from prev to current (0.75)
            // Trail 1 = 50% from prev to current (0.5) 
            // Trail 2 = 25% from prev to current (0.25)
            const lerpFactor = 0.75 - (i * 0.25); // 0.75, 0.5, 0.25
            const trailX = prevX + (deltaX * lerpFactor);
            const trailY = prevY + (deltaY * lerpFactor);
            
            trailElement.style.left = trailX + "px";
            trailElement.style.top = trailY + "px";
            trailElement.style.display = "block";
            trailElement.style.visibility = "visible";
            
            // Match the main cursor's scale
            trailElement.style.transform = "translate(-50%, -50%) scale(" + currentScale + ")";
            
            // Apply opacity fading: 80%, 60%, 40%
            const opacity = 1 - (i + 1) * 0.2;
            trailElement.style.opacity = opacity.toString();
          } else {
            // Hide trails when there's no meaningful movement
            trailElement.style.display = "none";
            trailElement.style.visibility = "hidden";
          }
        }
      });
    }
    
    // Update global mouse position - keep history
    if (!window.__mousePrevious) window.__mousePrevious = { x: mouseX, y: mouseY };
    if (!window.__mousePosition) window.__mousePosition = { x: mouseX, y: mouseY };
    
    // Shift the history
    window.__mousePrevious = { ...window.__mousePosition };
    window.__mousePosition = { x: mouseX, y: mouseY };
  }

  // Store functions globally for external access
  window.__recreateCursor = createCursor;
  window.__updateCursorPosition = updateCursorPosition;

  // Create initial cursor
  createCursor();

  // Monitor for cursor removal and recreate only when needed
  const observer = new MutationObserver((mutations) => {
    const cursor = document.getElementById("e2e-cursor-overlay");
    if (!cursor) {
      // Cursor was removed, recreate it
      createCursor();
      // Update to current position after recreation
      if (window.__mousePosition) {
        const newCursor = document.getElementById("e2e-cursor-overlay");
        if (newCursor) {
          newCursor.style.left = window.__mousePosition.x + "px";
          newCursor.style.top = window.__mousePosition.y + "px";
        }
      }
    }
  });

  // Observe the body for child list changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Store observer globally so it persists
  window.__cursorObserver = observer;
})();
`;

// Store last known mouse position in page context - this persists across page navigations
let lastKnownMousePosition: { x: number; y: number } | null = null;

// Enhanced position tracking that survives page changes
export function getLastKnownPosition(): { x: number; y: number } | null {
  return lastKnownMousePosition;
}

export function setLastKnownPosition(x: number, y: number): void {
  lastKnownMousePosition = { x, y };
}

export async function injectCursorOverlayOnAllPages(page: Page): Promise<void> {
  // Initialize with center position if not set
  if (!lastKnownMousePosition) {
    const viewport = page.viewport();
    if (viewport) {
      lastKnownMousePosition = {
        x: viewport.width / 2,
        y: viewport.height / 2,
      };
    } else {
      lastKnownMousePosition = { x: 640, y: 360 }; // Default for 1280x720
    }
  }

  // Create a modified script that includes the last known position
  const scriptWithPosition = `
    // Set initial mouse position from last known position
    window.__mousePosition = ${JSON.stringify(lastKnownMousePosition)};
    ${CURSOR_SCRIPT}
  `;

  // Inject cursor script on every page load/navigation
  await page.evaluateOnNewDocument(scriptWithPosition);

  // Also inject immediately on the current page
  await page.evaluate(scriptWithPosition);

  // Set up event listeners for page navigation
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      // Small delay to let the page settle, then inject cursor
      setTimeout(async () => {
        try {
          // Re-inject with preserved position (lastKnownMousePosition is maintained across navigation)
          const updatedScript = `
            // Set initial mouse position from preserved position
            window.__mousePosition = ${JSON.stringify(lastKnownMousePosition)};
            ${CURSOR_SCRIPT}
          `;
          await page.evaluate(updatedScript);

          // Also set the actual Puppeteer mouse position to match
          if (lastKnownMousePosition) {
            await page.mouse.move(
              lastKnownMousePosition.x,
              lastKnownMousePosition.y,
            );
          }
        } catch (_error) {
          // Failed to preserve cursor position after navigation
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
  // Update our stored position
  lastKnownMousePosition = { x, y };

  await page.evaluate((coords) => {
    // Only recreate cursor if it doesn't exist - don't override existing styling
    let cursor = document.getElementById("e2e-cursor-overlay");
    if (
      !cursor &&
      typeof (globalThis as CursorGlobals).__recreateCursor === "function"
    ) {
      (globalThis as CursorGlobals).__recreateCursor!();
      cursor = document.getElementById("e2e-cursor-overlay");
    }

    if (cursor) {
      cursor.style.left = coords.x + "px";
      cursor.style.top = coords.y + "px";
      cursor.style.display = "block";
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
    // Only recreate cursor if it doesn't exist - don't destroy existing cursor
    let cursor = document.getElementById("e2e-cursor-overlay");
    if (
      !cursor &&
      typeof (globalThis as CursorGlobals).__recreateCursor === "function"
    ) {
      (globalThis as CursorGlobals).__recreateCursor!();
      cursor = document.getElementById("e2e-cursor-overlay");
    }

    if (!cursor) {
      return;
    }

    // Define colors for different states
    let mainColor, shadowColor, scale;
    switch (cursorStyle) {
      case "click":
        mainColor = "rgba(0, 255, 0, 0.95)";
        shadowColor = "rgba(0, 255, 0";
        scale = "1.4";
        break;
      case "hover":
        mainColor = "rgba(255, 140, 0, 0.9)";
        shadowColor = "rgba(255, 140, 0";
        scale = "1.2";
        break;
      default:
        mainColor = "rgba(255, 20, 20, 0.95)";
        shadowColor = "rgba(255, 20, 20";
        scale = "1";
        break;
    }

    // Update main cursor
    cursor.style.background = mainColor;
    cursor.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
    cursor.style.boxShadow = "0 0 20px " + shadowColor + ", 0.9), 0 0 40px " +
      shadowColor + ", 0.5)";

    // Update trail elements with same color but consistent sizing
    const trailElements = (globalThis as CursorGlobals).__e2eCursorTrail;
    if (trailElements) {
      trailElements.forEach((trailElement, i) => {
        if (trailElement) {
          const TRAIL_FADE_SPEED = 0.2;
          const opacity = 1 - (i + 1) * TRAIL_FADE_SPEED;

          // No size changes - motion blur only affects opacity

          // Extract RGB values from main color for trail
          const trailOpacity = opacity * 0.6;
          const trailMainColor = mainColor.replace(
            /[^,]+(?=\))/,
            trailOpacity.toString(),
          );

          trailElement.style.background = trailMainColor;
          trailElement.style.boxShadow = "0 0 20px " + shadowColor + ", " +
            (opacity * 0.5) + ")";
          trailElement.style.opacity = opacity.toString();

          // Ensure trail elements match the main cursor's scale
          trailElement.style.transform = "translate(-50%, -50%) scale(" +
            scale + ")";
        }
      });
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
    // Disconnect observer
    if ((globalThis as CursorGlobals).__cursorObserver) {
      (globalThis as CursorGlobals).__cursorObserver!.disconnect();
      delete (globalThis as CursorGlobals).__cursorObserver;
    }

    // Remove all cursor elements (main cursor and trail)
    const allCursorElements = document.querySelectorAll("[id^='e2e-cursor-']");
    allCursorElements.forEach((element) => element.remove());

    // Clean up globals
    delete (globalThis as CursorGlobals).__e2eCursor;
    delete (globalThis as CursorGlobals).__e2eCursorTrail;
    delete (globalThis as CursorGlobals).__mousePosition;
    delete (globalThis as CursorGlobals).__recreateCursor;
    delete (globalThis as CursorGlobals).__updateCursorPosition;

    // Cursor and trail completely removed
  });
}
