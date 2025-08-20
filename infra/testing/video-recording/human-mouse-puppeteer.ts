/**
 * Human Mouse integration for Puppeteer
 * Provides natural, human-like mouse movements for smooth-ui framework
 */

import type { Page } from "puppeteer-core";
import type { CursorGlobals } from "./cursor-types.ts";
import {
  setCursorStyle,
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

  // Get current mouse position
  const currentPos = await page.evaluate(() => {
    const stored = (globalThis as CursorGlobals).__mousePosition;
    return stored || { x: 640, y: 360 };
  });

  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(targetX - currentPos.x, 2) + Math.pow(targetY - currentPos.y, 2),
  );

  if (distance < 5) {
    // Very small movement, just move directly
    await page.mouse.move(targetX, targetY);
    await updateCursorPosition(page, targetX, targetY);
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

    // Update cursor overlay and handle interactive elements
    try {
      await updateCursorPosition(page, x, y);

      // Check for interactive elements and update cursor style
      const isOverInteractive = await page.evaluate(
        (mouseX, mouseY) => {
          const element = document.elementFromPoint(mouseX, mouseY);
          if (!element) return false;

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

      await setCursorStyle(page, isOverInteractive ? "hover" : "default");
    } catch {
      // Cursor overlay might not be available
    }

    // Variable timing between frames to simulate human inconsistency
    const variableDelay = frameDelay * randomBetween(0.8, 1.2);
    await new Promise((resolve) => setTimeout(resolve, variableDelay));
  }
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
  const { button = "left", clickDelay, doubleClick = false } = options;

  // Move to position first
  await humanMoveTo(page, x, y);

  // Pause before click (human reaction time)
  const preClickDelay = clickDelay ?? randomBetween(50, 150);
  await new Promise((resolve) => setTimeout(resolve, preClickDelay));

  // Show click animation
  try {
    await setCursorStyle(page, "click");
  } catch {
    // Cursor overlay might not be available
  }

  // Small random offset for imperfect clicking
  const offsetX = x + randomBetween(-1, 1);
  const offsetY = y + randomBetween(-1, 1);

  await page.mouse.click(offsetX, offsetY, { button });

  if (doubleClick) {
    // Random delay between clicks for double-click
    const doubleClickDelay = randomBetween(80, 150);
    await new Promise((resolve) => setTimeout(resolve, doubleClickDelay));
    await page.mouse.click(offsetX, offsetY, { button });
  }

  // Post-click pause
  const postClickDelay = randomBetween(100, 200);
  await new Promise((resolve) => setTimeout(resolve, postClickDelay));

  // Reset cursor style
  try {
    await setCursorStyle(page, "default");
  } catch {
    // Cursor overlay might not be available
  }
}
