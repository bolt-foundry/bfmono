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
  pixelsPerSecond = 800, // Consistent movement speed
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
    100,
    Math.min(1500, (distance / pixelsPerSecond) * 1000),
  ); // Min 100ms, max 1.5s

  const steps = Math.max(5, Math.min(30, Math.ceil(duration / 50))); // 5-30 steps, ~50ms per step
  const stepDelay = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);

    const x = currentPos.x + (targetX - currentPos.x) * eased;
    const y = currentPos.y + (targetY - currentPos.y) * eased;

    await page.mouse.move(x, y);

    // Update cursor overlay to follow mouse movement
    try {
      await updateCursorPosition(page, x, y);
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
