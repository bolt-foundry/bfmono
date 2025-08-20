# Human Mouse - TypeScript

A TypeScript port of the Python
[human_mouse](https://github.com/sarperavci/human_mouse) library that provides
human-like mouse movement and clicking functionality.

## Features

- **Natural Movement**: Uses spline interpolation for smooth, human-like cursor
  paths
- **Random Variations**: Adds jitter and randomness to make movements appear
  more natural
- **Configurable Speed**: Adjustable movement speed and timing
- **Multiple Click Types**: Support for left, right, and double clicks
- **Screen Boundary Handling**: Automatically clamps coordinates to screen
  bounds
- **Cross-platform Ready**: Designed with platform abstraction for easy
  integration

## Installation

Since this is part of the bfmono repository, you can import it directly:

```typescript
import { MouseController } from "@bfmono/lib/human-mouse/mod.ts";
```

## Usage

### Basic Usage

```typescript
import { MouseController } from "@bfmono/lib/human-mouse/mod.ts";

// Create a mouse controller
const mouse = new MouseController({
  speedFactor: 1.5,
  virtualDisplay: false,
});

// Move to specific coordinates
await mouse.move(500, 300);

// Perform a click
await mouse.performClick();

// Move and click in one operation
await mouse.moveAndClick(800, 600);
```

### Advanced Usage

```typescript
// Move to random location
await mouse.moveRandom(2.0);

// Double click
await mouse.performDoubleClick();

// Right click (context click)
await mouse.performContextClick();

// Custom click options
await mouse.performClick({
  button: "right",
  delay: 100,
});

// Get current position
const position = mouse.getCurrentPosition();
console.log(`Current position: ${position.x}, ${position.y}`);
```

## Configuration Options

### MouseControllerOptions

- `speedFactor?: number` - Movement speed multiplier (default: 1.0)
- `virtualDisplay?: boolean` - Enable virtual display mode (default: false)

### ClickOptions

- `button?: 'left' | 'right' | 'middle'` - Mouse button to click (default:
  'left')
- `doubleClick?: boolean` - Whether to perform a double click (default: false)
- `delay?: number` - Delay after click in milliseconds (default: random
  50-100ms)

## API Reference

### MouseController

#### Constructor

- `constructor(options?: MouseControllerOptions)`

#### Methods

- `move(targetX: number, targetY: number, speedFactor?: number): Promise<void>`
- `moveRandom(speedFactor?: number): Promise<void>`
- `performClick(options?: ClickOptions): Promise<void>`
- `performDoubleClick(options?: ClickOptions): Promise<void>`
- `performContextClick(options?: ClickOptions): Promise<void>`
- `moveAndClick(targetX: number, targetY: number, clickOptions?: ClickOptions, speedFactor?: number): Promise<void>`
- `getCurrentPosition(): Point`

## Platform Integration

This library provides platform abstraction through the `platformMouseMove` and
`platformMouseClick` methods. To integrate with actual mouse control:

### For Node.js with robotjs:

```typescript
// Replace the platform methods in MouseController
private async platformMouseMove(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
}

private async platformMouseClick(button: string, x: number, y: number): Promise<void> {
  robot.mouseClick(button as any);
}
```

### For Web Applications:

```typescript
// Use DOM events for web-based mouse simulation
private async platformMouseMove(x: number, y: number): Promise<void> {
  // Dispatch mouse move events or update cursor position
}

private async platformMouseClick(button: string, x: number, y: number): Promise<void> {
  // Dispatch click events on target elements
}
```

## Example

See `example.ts` for a complete demonstration of the library's capabilities.

```bash
deno run lib/human-mouse/example.ts
```

## Differences from Python Version

- **Async/Await**: All movement and click operations are asynchronous
- **TypeScript Types**: Full type safety with interfaces for all options
- **Platform Abstraction**: Ready for integration with different mouse control
  libraries
- **Modular Design**: Separated into logical modules (types, utils, mouse
  controller)
- **Enhanced Error Handling**: Better boundary checking and validation

## License

This TypeScript port maintains the same spirit and functionality as the original
Python library while adapting to TypeScript/JavaScript conventions and async
patterns.
