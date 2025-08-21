import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";
import {
  setCursorStyle,
  updateCursorPosition,
} from "./cursor-overlay-page-injection.ts";

export async function smoothMoveTo(
  page: Page,
  targetX: number,
  targetY: number,
  pixelsPerSecond = 2400, // 2x faster movement speed for demo videos
): Promise<void> {
  // Get current mouse position from our global state or default to center
  const currentPos = await page.evaluate(() => {
    const stored = (globalThis as CursorGlobals).__mousePosition;
    return stored || { x: 640, y: 360 }; // Default to center of 1280x720
  });

  // Calculate distance and duration based on speed
  const distance = Math.sqrt(
    Math.pow(targetX - currentPos.x, 2) + Math.pow(targetY - currentPos.y, 2),
  );
  const duration = Math.max(
    25,
    Math.min(800, (distance / pixelsPerSecond) * 1000),
  ); // Min 25ms, max 0.8s for snappy movements

  // Calculate steps to match 60fps (16.67ms per frame)
  // This ensures smooth movement that matches video framerate
  const targetFrameTime = 1000 / 60; // 60fps
  const steps = Math.max(5, Math.ceil(duration / targetFrameTime));
  const stepDelay = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    // Easing function (ease-in-out) - smooth acceleration and deceleration
    const eased = progress < 0.5
      ? 4 * progress * progress * progress // ease-in (first half)
      : 1 - Math.pow(-2 * progress + 2, 3) / 2; // ease-out (second half)

    const x = currentPos.x + (targetX - currentPos.x) * eased;
    const y = currentPos.y + (targetY - currentPos.y) * eased;

    await page.mouse.move(x, y);

    // Update cursor overlay to follow mouse movement
    try {
      await updateCursorPosition(page, x, y);

      // Check if we're hovering over an interactive element and update cursor style
      const isOverInteractive = await page.evaluate(
        (mouseX, mouseY) => {
          const element = document.elementFromPoint(mouseX, mouseY);
          if (!element) return false;

          // Check if element or any parent is interactive
          let current: Element | null = element;
          while (current) {
            const tagName = current.tagName?.toLowerCase();
            const role = current.getAttribute("role");
            const hasClickHandler = (current as HTMLElement).onclick !== null;
            const cursorStyle = (current as HTMLElement).style?.cursor;

            if (
              tagName === "a" ||
              tagName === "button" ||
              tagName === "input" ||
              tagName === "select" ||
              tagName === "textarea" ||
              role === "button" ||
              role === "link" ||
              hasClickHandler ||
              cursorStyle === "pointer"
            ) {
              return true;
            }
            current = current.parentElement;
          }
          return false;
        },
        x,
        y,
      );

      // Set appropriate cursor style
      await setCursorStyle(page, isOverInteractive ? "hover" : "default");
    } catch {
      // Cursor overlay might not be injected yet, ignore
    }

    await new Promise((resolve) => setTimeout(resolve, stepDelay));
  }
}

export async function smoothClick(page: Page, selector: string): Promise<void> {
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

  // Brief pause to let hover state settle and be visible
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Show click animation
  try {
    await setCursorStyle(page, "click");
  } catch {
    // Cursor overlay might not be available
  }

  await page.mouse.click(centerX, centerY);

  // Reset cursor style after click
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await setCursorStyle(page, "default");
  } catch {
    // Cursor overlay might not be available
  }
}

export async function smoothHover(page: Page, selector: string): Promise<void> {
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

  // Show hover style
  try {
    await setCursorStyle(page, "hover");
  } catch {
    // Cursor overlay might not be available
  }
}
