# Human Mouse Integration for Smooth-UI

Human-like mouse movements are now **built directly into** the smooth-ui
framework. When smooth animations are enabled, all mouse interactions
automatically use natural curved paths and human-like timing variations.

## Features

### Natural Mouse Movements (Built-in)

- **Spline-based paths**: Uses Bézier curves instead of linear movement
- **Random variations**: Adds natural jitter and timing inconsistencies
- **Perpendicular offsets**: Creates realistic curved paths between points
- **Variable timing**: Simulates human reaction times and movement speeds

### Seamless Integration

- **Zero configuration**: Human-like movement is automatically enabled with
  smooth interactions
- **Backward compatible**: All existing smooth-ui code works unchanged
- **Performance optimized**: Fast path for unit tests, human-like for video
  recording
- **Single setting**: Control everything with just `BF_E2E_SMOOTH`

## Configuration

Simple, single-flag control:

```bash
# Enable smooth animations with human-like mouse movements (default: true)
BF_E2E_SMOOTH=true

# Disable for fast unit testing 
BF_E2E_SMOOTH=false
```

## Usage

### Standard Usage (Recommended)

Your existing smooth-ui code automatically gets human-like movements:

```typescript
import { smoothClick, smoothFocus } from "./smooth-ui.ts";

// These automatically use human-like movements when BF_E2E_SMOOTH=true
await smoothClick(page, "#submit-button");
await smoothFocus(page, "#email-input");
```

### Direct Access to Human Movement

If you need explicit control over human-like movements:

```typescript
import { humanClick, humanMoveTo } from "./human-mouse-puppeteer.ts";

// Core human movement with all natural variations
await humanMoveTo(page, 400, 200);

// Human click with timing variations
await humanClick(page, 400, 200, {
  button: "right",
  doubleClick: true,
});
```

## How It Works

### Movement Algorithm

1. **Start Position**: Gets current mouse position from Puppeteer state
2. **Path Generation**: Creates Bézier curve with 1-2 random control points
3. **Natural Variations**: Adds perpendicular offsets and micro-jitter
4. **Timing Simulation**: Uses variable frame delays to simulate human
   inconsistency
5. **Interactive Detection**: Automatically detects hover states and updates
   cursor

### Human-Like Characteristics

- **Curved paths**: Never moves in perfectly straight lines
- **Speed variations**: Accelerates and decelerates naturally
- **Micro-jitter**: Small random offsets during movement
- **Reaction delays**: Realistic pauses before clicks
- **Imperfect clicking**: Tiny random offsets from exact center

## Configuration Examples

### Maximum Quality (Video Recording)

```bash
BF_E2E_SMOOTH=true
# Human-like movements automatically enabled
```

### Maximum Speed (Unit Testing)

```bash
BF_E2E_SMOOTH=false  
# Direct clicks without animations
```

## Compatibility

- ✅ Works with existing smooth-ui framework
- ✅ Compatible with cursor overlay system
- ✅ Maintains screenshot and video recording features
- ✅ Preserves interactive element detection
- ✅ Supports all Puppeteer mouse operations
- ✅ Zero breaking changes from previous versions

## Benefits

- **Simplified Configuration**: One flag controls everything
- **Better Default Behavior**: Human-like movement is now the standard for
  smooth interactions
- **Consistent Experience**: All smooth animations use natural movement patterns
- **Performance Optimized**: Fast path preserved for unit testing
- **Zero Migration**: Existing code works exactly the same

This integration transforms the smooth-ui framework to use human-like movements
by default, making realistic interactions the standard while preserving fast
testing capabilities when needed.
