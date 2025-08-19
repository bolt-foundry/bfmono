import type { CDPSession, Page } from "puppeteer-core";
import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);
import {
  convertFramesToVideo,
  type VideoConversionOptions,
  type VideoConversionResult,
} from "./video-converter.ts";

export interface VideoRecordingSession {
  frames: Array<Uint8Array>;
  startTime: number;
  name: string;
  outputDir: string;
  cdpSession?: CDPSession; // Store CDP session for cleanup
}

export async function _startScreencastRecordingInternal(
  page: Page,
  name: string,
  outputDir = "/tmp/videos",
): Promise<VideoRecordingSession> {
  const cdpSession = await page.target().createCDPSession();

  await ensureDir(outputDir);

  // Get current viewport dimensions to match screencast
  const viewport = page.viewport();
  const maxWidth = viewport?.width || 1280;
  const maxHeight = viewport?.height || 800;

  const session: VideoRecordingSession = {
    frames: [],
    startTime: Date.now(),
    name,
    outputDir,
    cdpSession, // Store CDP session reference
  };

  await cdpSession.send("Page.enable");

  // CRITICAL FIX: Lock viewport dimensions using Device Metrics Override
  // This prevents dimension changes when DOM overlays are injected
  await cdpSession.send("Emulation.setDeviceMetricsOverride", {
    width: maxWidth,
    height: maxHeight,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: maxWidth,
    screenHeight: maxHeight,
  });

  // ADDITIONAL FIX: Explicitly set visible size for screencast recording
  // This ensures screencast dimensions match exactly regardless of browser UI
  try {
    await cdpSession.send("Emulation.setVisibleSize", {
      width: maxWidth,
      height: maxHeight,
    });
    logger.info(
      `Visible size set to ${maxWidth}×${maxHeight} for screencast consistency`,
    );
  } catch (error) {
    logger.warn(
      "setVisibleSize not supported, falling back to device metrics only:",
      error,
    );
  }

  logger.info(
    `Device metrics locked to ${maxWidth}×${maxHeight} for stable recording`,
  );

  await cdpSession.send("Page.startScreencast", {
    format: "png",
    quality: 80,
    maxWidth,
    maxHeight,
    everyNthFrame: 1, // Capture every frame
  });

  cdpSession.on("Page.screencastFrame", (frame) => {
    const frameBuffer = new Uint8Array(
      atob(frame.data).split("").map((c) => c.charCodeAt(0)),
    );
    session.frames.push(frameBuffer);

    // Acknowledge the frame with error handling
    try {
      cdpSession.send("Page.screencastFrameAck", {
        sessionId: frame.sessionId,
      }).catch(() => {
        // Ignore acknowledgment errors during cleanup
      });
    } catch {
      // Ignore acknowledgment errors during cleanup
    }
  });

  return session;
}

export async function _stopScreencastRecordingInternal(
  page: Page,
  session: VideoRecordingSession,
  videoOptions: VideoConversionOptions = {},
): Promise<VideoConversionResult> {
  // By default, convert to video with frame preservation
  const defaultOptions: VideoConversionOptions = {
    preserveFrames: true,
    ...videoOptions,
  };

  return await _stopScreencastRecordingWithVideoInternal(
    page,
    session,
    defaultOptions,
  );
}

export async function _stopScreencastRecordingFramesOnlyInternal(
  page: Page,
  session: VideoRecordingSession,
): Promise<string> {
  // Use the stored CDP session if available, otherwise create a new one
  const cdpSession = session.cdpSession ||
    await page.target().createCDPSession();

  try {
    await cdpSession.send("Page.stopScreencast");
  } catch (error) {
    // Ignore errors if the session is already closed
    logger.warn("Failed to stop screencast:", error);
  }

  // Clean up the stored CDP session
  if (session.cdpSession) {
    try {
      await session.cdpSession.detach();
    } catch (error) {
      // Ignore cleanup errors
      logger.warn("Failed to detach CDP session:", error);
    }
    session.cdpSession = undefined;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const frameDir = join(session.outputDir, `${timestamp}_${session.name}`);

  await ensureDir(frameDir);

  // Save all frames as PNG files
  const framePromises = session.frames.map(async (frame, index) => {
    const frameNumber = index.toString().padStart(6, "0");
    const framePath = join(frameDir, `frame_${frameNumber}.png`);
    await Deno.writeFile(framePath, frame);
  });

  await Promise.all(framePromises);

  // Saved frames to directory

  return frameDir;
}

export async function _stopScreencastRecordingWithVideoInternal(
  page: Page,
  session: VideoRecordingSession,
  videoOptions: VideoConversionOptions = {},
): Promise<VideoConversionResult> {
  // First stop recording and save frames
  const frameDir = await _stopScreencastRecordingFramesOnlyInternal(
    page,
    session,
  );

  // Then convert frames to video
  const videoResult = await convertFramesToVideo(frameDir, videoOptions);

  return videoResult;
}
