/**
 * MouseController - TypeScript port of the Python human_mouse library
 * Provides human-like mouse movement and clicking functionality
 */

import type {
  ClickOptions,
  MouseControllerOptions,
  Point,
  ScreenSize,
} from "./types.ts";
import {
  clamp,
  createDelay,
  generateSplinePoints,
  randomBetween,
} from "./utils.ts";

export class MouseController {
  private speedFactor: number;
  private virtualDisplay: boolean;
  private screenSize: ScreenSize;
  private currentPosition: Point;

  constructor(options: MouseControllerOptions = {}) {
    this.speedFactor = options.speedFactor ?? 1.0;
    this.virtualDisplay = options.virtualDisplay ?? false;

    // Get screen dimensions (in a real implementation, this would use a platform-specific API)
    this.screenSize = this.getScreenSize();
    this.currentPosition = { x: 0, y: 0 };

    // Initialize current mouse position (in a real implementation, this would get actual mouse position)
    this.getCurrentMousePosition();
  }

  /**
   * Get screen dimensions
   * Note: In a real implementation, this would use platform-specific APIs
   * like robotjs, or web APIs in browser environment
   */
  private getScreenSize(): ScreenSize {
    // Placeholder implementation - in real usage, this would get actual screen size
    if (typeof window !== "undefined" && globalThis.screen) {
      return {
        width: globalThis.screen.width,
        height: globalThis.screen.height,
      };
    }

    // Default fallback
    return { width: 1920, height: 1080 };
  }

  /**
   * Get current mouse position
   * Note: In a real implementation, this would use platform-specific APIs
   */
  private getCurrentMousePosition(): void {
    // Placeholder implementation - in real usage, this would get actual mouse position
    // For now, we'll start at center of screen
    this.currentPosition = {
      x: this.screenSize.width / 2,
      y: this.screenSize.height / 2,
    };
  }

  /**
   * Move mouse to specific coordinates with human-like movement
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   * @param speedFactor - Speed multiplier (optional)
   */
  async move(
    targetX: number,
    targetY: number,
    speedFactor?: number,
  ): Promise<void> {
    const speed = speedFactor ?? this.speedFactor;

    // Clamp target coordinates to screen bounds
    const clampedX = clamp(targetX, 0, this.screenSize.width - 1);
    const clampedY = clamp(targetY, 0, this.screenSize.height - 1);

    // Calculate movement distance and time
    const distance = Math.sqrt(
      Math.pow(clampedX - this.currentPosition.x, 2) +
        Math.pow(clampedY - this.currentPosition.y, 2),
    );

    // Calculate number of points based on distance and speed
    const numPoints = Math.max(10, Math.floor(distance / (5 * speed)));

    // Generate spline points for natural movement
    const points = generateSplinePoints(
      this.currentPosition.x,
      this.currentPosition.y,
      clampedX,
      clampedY,
      numPoints,
    );

    // Move along the spline path
    for (let i = 1; i < points.length; i++) {
      const point = points[i];

      // Add small random variations for more human-like movement
      const jitterX = randomBetween(-1, 1);
      const jitterY = randomBetween(-1, 1);

      const finalX = clamp(point.x + jitterX, 0, this.screenSize.width - 1);
      const finalY = clamp(point.y + jitterY, 0, this.screenSize.height - 1);

      // In a real implementation, this would call the platform's mouse move API
      await this.platformMouseMove(finalX, finalY);

      // Update current position
      this.currentPosition = { x: finalX, y: finalY };

      // Small delay between movements
      const delay = randomBetween(1, 3) / speed;
      await createDelay(delay);
    }
  }

  /**
   * Move mouse to random coordinates
   * @param speedFactor - Speed multiplier (optional)
   */
  async moveRandom(speedFactor?: number): Promise<void> {
    const targetX = randomBetween(50, this.screenSize.width - 50);
    const targetY = randomBetween(50, this.screenSize.height - 50);

    await this.move(targetX, targetY, speedFactor);
  }

  /**
   * Perform a mouse click
   * @param options - Click options
   */
  async performClick(options: ClickOptions = {}): Promise<void> {
    const button = options.button ?? "left";
    const delay = options.delay ?? randomBetween(50, 100);

    // In a real implementation, this would call the platform's mouse click API
    await this.platformMouseClick(
      button,
      this.currentPosition.x,
      this.currentPosition.y,
    );

    await createDelay(delay);
  }

  /**
   * Perform a double click
   * @param options - Click options
   */
  async performDoubleClick(options: ClickOptions = {}): Promise<void> {
    await this.performClick(options);

    // Random delay between clicks
    const betweenDelay = randomBetween(50, 150);
    await createDelay(betweenDelay);

    await this.performClick(options);
  }

  /**
   * Perform a right click (context click)
   * @param options - Click options
   */
  async performContextClick(options: ClickOptions = {}): Promise<void> {
    const contextOptions = { ...options, button: "right" as const };
    await this.performClick(contextOptions);
  }

  /**
   * Move and click at target coordinates
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   * @param clickOptions - Click options
   * @param speedFactor - Movement speed factor
   */
  async moveAndClick(
    targetX: number,
    targetY: number,
    clickOptions: ClickOptions = {},
    speedFactor?: number,
  ): Promise<void> {
    await this.move(targetX, targetY, speedFactor);
    await this.performClick(clickOptions);
  }

  /**
   * Get current mouse position
   */
  getCurrentPosition(): Point {
    return { ...this.currentPosition };
  }

  /**
   * Platform-specific mouse movement implementation
   * In a real implementation, this would use robotjs, or browser APIs, etc.
   */
  private platformMouseMove(x: number, y: number): void {
    // Placeholder - in real implementation this would call:
    // - robotjs.moveMouse(x, y) for Node.js
    // - Browser APIs for web applications
    // - Platform-specific APIs for different environments

    // Simulated mouse movement to: x, y
    void x;
    void y;
  }

  /**
   * Platform-specific mouse click implementation
   * In a real implementation, this would use robotjs, or browser APIs, etc.
   */
  private platformMouseClick(
    button: string,
    x: number,
    y: number,
  ): void {
    // Placeholder - in real implementation this would call:
    // - robotjs.mouseClick(button) for Node.js
    // - Browser click events for web applications
    // - Platform-specific APIs for different environments

    // Simulated click: button at x, y
    void button;
    void x;
    void y;
  }
}
