/**
 * Human Mouse integration for Puppeteer
 * Provides natural, human-like mouse movements for smooth-ui framework
 */

import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";
import {
  getLastKnownPosition,
  setCursorStyle,
  setLastKnownPosition,
  updateCursorPosition,
} from "./cursor-overlay-page-injection.ts";

// Utility functions for natural movement
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate cubic spline interpolation points for natural movement
 */
function generateSplinePoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  numPoints: number = 30,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  // Generate 1-2 control points for more natural movement
  const numControlPoints = Math.random() > 0.5 ? 2 : 1;
  const controlPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < numControlPoints; i++) {
    const t = (i + 1) / (numControlPoints + 1);
    const baseX = startX + (endX - startX) * t;
    const baseY = startY + (endY - startY) * t;

    // Add random offset perpendicular to the direct path
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const maxOffset = Math.min(50, distance * 0.1); // Max 10% of distance or 50px

    const perpX = -(endY - startY) / distance; // Perpendicular vector
    const perpY = (endX - startX) / distance;

    const offset = randomBetween(-maxOffset, maxOffset);

    controlPoints.push({
      x: baseX + perpX * offset,
      y: baseY + perpY * offset,
    });
  }

  // Generate smooth curve through control points
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    if (numControlPoints === 1) {
      // Quadratic Bézier curve
      const cp = controlPoints[0];
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cp.x +
        t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cp.y +
        t * t * endY;
      points.push({ x, y });
    } else {
      // Cubic Bézier curve
      const cp1 = controlPoints[0];
      const cp2 = controlPoints[1];
      const x = (1 - t) ** 3 * startX +
        3 * (1 - t) ** 2 * t * cp1.x +
        3 * (1 - t) * t ** 2 * cp2.x +
        t ** 3 * endX;
      const y = (1 - t) ** 3 * startY +
        3 * (1 - t) ** 2 * t * cp1.y +
        3 * (1 - t) * t ** 2 * cp2.y +
        t ** 3 * endY;
      points.push({ x, y });
    }
  }

  return points;
}

/**
 * Human-like mouse movement with natural variations
 */
export async function humanMoveTo(
  page: Page,
  targetX: number,
  targetY: number,
  options: {
    speedFactor?: number;
    humanLike?: boolean;
  } = {},
): Promise<void> {
  const { speedFactor = 1.0, humanLike = true } = options;

  // Get current mouse position with enhanced persistence
  const currentPos = await page.evaluate(() => {
    const stored = (globalThis as CursorGlobals).__mousePosition;
    return stored;
  }) || getLastKnownPosition() || { x: 640, y: 360 };

  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(targetX - currentPos.x, 2) + Math.pow(targetY - currentPos.y, 2),
  );

  if (distance < 5) {
    // Very small movement, just move directly
    await page.mouse.move(targetX, targetY);
    await updateCursorPosition(page, targetX, targetY);
    setLastKnownPosition(targetX, targetY); // Persist position for page changes
    return;
  }

  if (!humanLike) {
    // Fall back to original smooth movement
    const duration = Math.max(
      100,
      Math.min(1500, (distance / (1200 * speedFactor)) * 1000),
    );
    const steps = Math.max(5, Math.ceil(duration / (1000 / 60)));
    const stepDelay = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const x = currentPos.x + (targetX - currentPos.x) * eased;
      const y = currentPos.y + (targetY - currentPos.y) * eased;

      await page.mouse.move(x, y);
      await updateCursorPosition(page, x, y);
      setLastKnownPosition(x, y); // Persist position for page changes
      await new Promise((resolve) => setTimeout(resolve, stepDelay));
    }
    return;
  }

  // Human-like movement with spline interpolation
  const baseSpeed = 800; // Base pixels per second
  const adjustedSpeed = baseSpeed * speedFactor;

  // Calculate timing with some randomness
  const baseDuration = (distance / adjustedSpeed) * 1000;
  const randomFactor = randomBetween(0.8, 1.2);
  const duration = Math.max(200, baseDuration * randomFactor);

  // Generate natural curve points
  const numPoints = Math.max(15, Math.floor(distance / 20));
  const splinePoints = generateSplinePoints(
    currentPos.x,
    currentPos.y,
    targetX,
    targetY,
    numPoints,
  );

  // Calculate frame timing for smooth 60fps movement
  const frameTime = 1000 / 60;
  const totalFrames = Math.max(10, Math.floor(duration / frameTime));
  const frameDelay = duration / totalFrames;

  // Track hover state - mirrors what the browser shows, persisting between checks
  let currentHoverState = false;
  let lastDetectedCursor = "default";
  let hoverCheckCounter = 0;

  // Move along the spline path
  for (let frame = 0; frame <= totalFrames; frame++) {
    const progress = frame / totalFrames;

    // Add ease-in-out to the overall movement
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Get point along spline
    const pointIndex = easedProgress * (splinePoints.length - 1);
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.min(lowerIndex + 1, splinePoints.length - 1);
    const localProgress = pointIndex - lowerIndex;

    const lowerPoint = splinePoints[lowerIndex];
    const upperPoint = splinePoints[upperIndex];

    // Interpolate between points
    let x = lowerPoint.x + (upperPoint.x - lowerPoint.x) * localProgress;
    let y = lowerPoint.y + (upperPoint.y - lowerPoint.y) * localProgress;

    // Add micro-jitter for human-like imperfection
    if (frame > 2 && frame < totalFrames - 2) { // Don't jitter at start/end
      const jitterAmount = Math.min(2, distance * 0.001);
      x += randomBetween(-jitterAmount, jitterAmount);
      y += randomBetween(-jitterAmount, jitterAmount);
    }

    // Clamp to screen bounds (assume reasonable screen size)
    x = clamp(x, 0, 3840);
    y = clamp(y, 0, 2160);

    await page.mouse.move(x, y);

    // Update cursor overlay position and persist the position
    try {
      await updateCursorPosition(page, x, y);
      setLastKnownPosition(x, y); // Ensure position persists across page changes
    } catch {
      // Cursor overlay might not be available
    }

    // Check hover state every few frames to reduce jitter while still catching boundary crossings
    hoverCheckCounter++;
    if (hoverCheckCounter % 3 === 0) { // Check every 3rd frame to reduce rapid transitions
      try {
        const browserCursor = await page.evaluate(
          (mouseX, mouseY) => {
            // Just ask the browser: what cursor should be shown at this position?
            const element = document.elementFromPoint(mouseX, mouseY);
            if (!element) return "default";

            // Get the browser's computed cursor - this is what the browser would naturally show
            const computedStyle = globalThis.getComputedStyle(element);
            const cursor = computedStyle.cursor || "default";

            return cursor;
          },
          x,
          y,
        );

        // Update our last detected cursor state
        lastDetectedCursor = browserCursor;
      } catch {
        // Cursor overlay might not be available - keep using last detected cursor
      }
    }

    // Always use the last detected cursor state to determine overlay style
    let overlayStyle: "default" | "hover" | "click";
    if (
      lastDetectedCursor === "pointer" || lastDetectedCursor === "grab" ||
      lastDetectedCursor === "grabbing"
    ) {
      overlayStyle = "hover";
    } else if (lastDetectedCursor === "text") {
      overlayStyle = "hover"; // Could be a different style if needed
    } else {
      overlayStyle = "default";
    }

    // Update cursor style if it changed, but only after a brief delay to prevent rapid flickering
    if ((overlayStyle === "hover") !== currentHoverState) {
      currentHoverState = overlayStyle === "hover";

      // Add small delay to prevent rapid cursor style changes during boundary crossings
      const styleUpdateDelay = Math.min(50, frameDelay * 0.5);
      setTimeout(async () => {
        try {
          await setCursorStyle(page, overlayStyle);
        } catch {
          // Cursor overlay might not be available
        }
      }, styleUpdateDelay);
    }

    // Variable timing between frames to simulate human inconsistency
    const variableDelay = frameDelay * randomBetween(0.8, 1.2);
    await new Promise((resolve) => setTimeout(resolve, variableDelay));
  }

  // Final cursor state is already set during the last frame of movement loop
}

/**
 * Human-like clicking with natural timing variations
 */
export async function humanClick(
  page: Page,
  x: number,
  y: number,
  options: {
    button?: "left" | "right" | "middle";
    clickDelay?: number;
    doubleClick?: boolean;
  } = {},
): Promise<void> {
  const { button = "left", clickDelay: _clickDelay, doubleClick = false } =
    options;

  // Move to position first
  await humanMoveTo(page, x, y);

  // Extra pause after movement to let hover state settle and be visible
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Show click animation
  try {
    await setCursorStyle(page, "click");
  } catch {
    // Cursor overlay might not be available
  }

  // Brief pause before actual click for visual feedback (like original smooth-ui)
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Small random offset for imperfect clicking
  const offsetX = x + randomBetween(-1, 1);
  const offsetY = y + randomBetween(-1, 1);

  await page.mouse.click(offsetX, offsetY, { button });

  // Pause after click to show the click effect
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (doubleClick) {
    // Show click animation again for double click
    try {
      await setCursorStyle(page, "click");
    } catch {
      // Cursor overlay might not be available
    }

    // Random delay between clicks for double-click
    const doubleClickDelay = randomBetween(80, 150);
    await new Promise((resolve) => setTimeout(resolve, doubleClickDelay));
    await page.mouse.click(offsetX, offsetY, { button });

    // Pause after second click
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Reset cursor style after click
  try {
    await setCursorStyle(page, "default");
  } catch {
    // Cursor overlay might not be available
  }

  // Final pause to let UI state settle after click (like original smooth-ui)
  await new Promise((resolve) => setTimeout(resolve, 200));
}
