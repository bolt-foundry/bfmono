/**
 * Utility functions for human-mouse library
 */

/**
 * Create a timing delay in milliseconds
 * @param interval - Delay interval in milliseconds
 */
export function createDelay(interval: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, interval));
}

/**
 * Generate random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generate cubic spline interpolation points
 * Simplified version of scipy's splrep/splev functionality
 */
export function generateSplinePoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  numPoints: number = 50,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  // Generate control points for more natural movement
  const midX = (startX + endX) / 2 + randomBetween(-50, 50);
  const midY = (startY + endY) / 2 + randomBetween(-50, 50);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Quadratic Bézier curve for smooth movement
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX +
      t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY +
      t * t * endY;

    points.push({ x, y });
  }

  return points;
}
