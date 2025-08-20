# Human Mouse Integration for Smooth-UI

This integration brings natural, human-like mouse movements to the smooth-ui
video recording framework by incorporating the human-mouse library algorithms
directly into Puppeteer-based testing.

## Features

### Natural Mouse Movements

- **Spline-based paths**: Uses Bézier curves instead of linear movement
- **Random variations**: Adds natural jitter and timing inconsistencies
- **Perpendicular offsets**: Creates realistic curved paths between points
- **Variable timing**: Simulates human reaction times and movement speeds

### Seamless Integration

- **Backward compatible**: Existing smooth-ui code works unchanged
- **Configuration-based**: Enable/disable via environment variables
- **Drop-in replacement**: Automatically enhances existing `smoothClick()`,
  `smoothFocus()` calls
- **Direct access**: New functions for explicit human-like movements

## Configuration

Control human-like mouse behavior via environment variables:

```bash
# Enable/disable human-like mouse movements (default: true)
BF_E2E_HUMAN_MOUSE=true

# Enable/disable smooth animations overall (default: true)  
BF_E2E_SMOOTH=true
```

## Usage

### Automatic Enhancement (Recommended)

Your existing smooth-ui code automatically gets human-like movements:

```typescript
import { smoothClick, smoothFocus } from "./smooth-ui.ts";

// These now use human-like movements when BF_E2E_HUMAN_MOUSE=true
await smoothClick(page, "#submit-button");
await smoothFocus(page, "#email-input");
```

### Direct Human-Like Functions

For explicit control over human-like movements:

```typescript
import { humanMouseClick, humanMouseMove } from "./smooth-ui.ts";

// Move mouse with natural curve and timing
await humanMouseMove(page, 500, 300, {
  speedFactor: 1.5, // 1.5x faster than default
  humanLike: true, // Enable natural variations
});

// Click with human-like timing and small position offset
await humanMouseClick(page, 500, 300, {
  button: "left",
  clickDelay: 100, // Custom pre-click delay
  doubleClick: false,
});
```

### Low-Level Puppeteer Integration

Access the core human-mouse algorithms directly:

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

### Spline Generation

```typescript
// Creates natural curved path between two points
function generateSplinePoints(startX, startY, endX, endY, numPoints) {
  // Generate 1-2 control points perpendicular to direct path
  // Create smooth Bézier curve through control points
  // Add natural variations and micro-offsets
}
```

### Human-Like Characteristics

- **Curved paths**: Never moves in perfectly straight lines
- **Speed variations**: Accelerates and decelerates naturally
- **Micro-jitter**: Small random offsets during movement
- **Reaction delays**: Realistic pauses before clicks
- **Imperfect clicking**: Tiny random offsets from exact center

## Files

- `human-mouse-puppeteer.ts` - Core human mouse implementation for Puppeteer
- `smooth-ui.ts` - Enhanced smooth-ui with human mouse integration
- `human-mouse-test.ts` - Test suite and verification
- `HUMAN_MOUSE_README.md` - This documentation

## Configuration Examples

### Maximum Human-Like Behavior

```bash
BF_E2E_SMOOTH=true
BF_E2E_HUMAN_MOUSE=true
```

### Fast Testing (Original Behavior)

```bash
BF_E2E_SMOOTH=false
BF_E2E_HUMAN_MOUSE=false
```

### Smooth But Not Human-Like

```bash
BF_E2E_SMOOTH=true
BF_E2E_HUMAN_MOUSE=false
```

## Performance Notes

- Human-like movements take ~20-40% longer than linear movements
- Adds realistic timing that improves video quality
- Use `speedFactor > 1.0` to accelerate movements while maintaining natural
  curves
- Disable for unit tests, enable for video recording

## Compatibility

- ✅ Works with existing smooth-ui framework
- ✅ Compatible with cursor overlay system
- ✅ Maintains screenshot and video recording features
- ✅ Preserves interactive element detection
- ✅ Supports all Puppeteer mouse operations

## Future Enhancements

Potential improvements for even more realistic behavior:

- **Fatigue simulation**: Gradually slower movements over time
- **Mouse acceleration**: Replicate OS-level acceleration curves
- **Individual quirks**: Persistent user-specific movement patterns
- **Contextual timing**: Different delays for different UI elements
- **Multi-monitor support**: Natural movements across screen boundaries

This integration transforms robotic test automation into natural, human-like
interactions perfect for creating compelling demo videos and realistic user
behavior simulation.
