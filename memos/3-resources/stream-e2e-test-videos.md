# Stream E2E Test Videos - Simple Plan

## Goal

Watch e2e tests running live - because debugging test failures sucks when you
can't see what happened.

## What We Have

- Existing video recording that captures 60fps PNG frames
- Human-like mouse movements and smooth interactions
- Works great, just saves to files after the fact

## Simple Approach

**WebSocket streaming** - just broadcast the existing frames in real-time
instead of only saving them.

```
[Existing Recorder] → [WebSocket] → [Simple HTML Viewer]
```

## Implementation (1-2 days max)

### Step 1: Add Streaming to Existing Recorder

- Modify `recorder.ts` to optionally broadcast frames via WebSocket
- When `BF_E2E_STREAM=true`, send frames to connected viewers
- Keep all existing video recording functionality

### Step 2: Dead Simple Viewer

- Single HTML file with canvas and WebSocket connection
- Shows live test stream in browser
- That's it.

```bash
BF_E2E_STREAM=true  # Just turn it on
```

## VS Code Integration (Maybe Later)

If we want to watch streams in VS Code instead of browser:

- Simple VS Code extension with webview
- Auto-opens stream when test starts
- But honestly, browser tab works fine for 3 people

## Files We'd Create

```
infra/testing/video-streaming/
├── simple-stream-server.ts   # ~50 lines of WebSocket server
└── viewer.html              # Basic HTML canvas viewer
```

That's it. No fancy architecture, no complex registry, just "make the existing
video recording also stream to browser".
