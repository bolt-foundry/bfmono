#!/usr/bin/env -S deno run -A

import { getLogger } from "@bolt-foundry/logger";
import type { TaskDefinition } from "../bft.ts";

const logger = getLogger(import.meta);

async function exec(
  cmd: string,
): Promise<{ stdout: string; stderr: string; success: boolean }> {
  const command = new Deno.Command("sh", {
    args: ["-c", cmd],
    stdout: "piped",
    stderr: "piped",
  });

  const output = await command.output();
  const stdout = new TextDecoder().decode(output.stdout);
  const stderr = new TextDecoder().decode(output.stderr);

  return { stdout, stderr, success: output.success };
}

async function checkProcess(pattern: string): Promise<boolean> {
  try {
    const { stdout } = await exec(
      `pgrep -f "${pattern}" > /dev/null 2>&1 && echo "running"`,
    );
    return stdout.trim() === "running";
  } catch {
    return false;
  }
}

async function containerStartup(): Promise<number> {
  logger.info("🚀 Starting container services...");

  // Check and start HTTPS proxy
  logger.info("Checking HTTPS proxy status...");
  const proxyRunning = await checkProcess("https-proxy-server.ts");

  if (!proxyRunning) {
    logger.info("Starting HTTPS proxy...");
    const { success, stderr } = await exec("bft proxy --start");

    if (!success) {
      logger.error("Failed to start HTTPS proxy:", stderr);
      return 1;
    }

    // Wait for proxy to fully start
    await new Promise((resolve) => setTimeout(resolve, 3000));
    logger.info("✅ HTTPS proxy started");
  } else {
    logger.info("✅ HTTPS proxy already running");
  }

  // Check and start boltfoundry-com dev server
  logger.info("Checking boltfoundry-com dev server status...");
  const devServerRunning = await checkProcess("bft dev boltfoundry-com") ||
    await checkProcess("deno.*boltfoundry-com") ||
    await checkProcess("vite.*boltfoundry-com");

  if (!devServerRunning) {
    logger.info("Starting boltfoundry-com dev server...");

    // Start dev server in background
    const logFile = "/tmp/boltfoundry-com-dev.log";
    const startCmd =
      `cd /internalbf/bfmono && nohup bft dev boltfoundry-com > ${logFile} 2>&1 &`;

    const { success, stderr } = await exec(startCmd);

    if (!success && stderr) {
      logger.error("Failed to start dev server:", stderr);
      return 1;
    }

    // Wait for server to start
    logger.info("Waiting for dev server to initialize...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify it started
    const isRunning = await checkProcess("boltfoundry-com");
    if (isRunning) {
      logger.info("✅ boltfoundry-com dev server started");
      logger.info(`   Logs: ${logFile}`);
    } else {
      logger.warn("⚠️  Dev server may not have started properly");
      logger.info(`   Check logs: ${logFile}`);
    }
  } else {
    logger.info("✅ boltfoundry-com dev server already running");
  }

  // Show final status
  logger.info("\n📊 Container services status:");
  logger.info("   HTTPS Proxy: https://*.codebot.local");
  logger.info(
    "   Dev Server: https://" + (await exec("hostname")).stdout.trim() +
      ".codebot.local",
  );

  // Show how to check logs
  logger.info("\n📝 To view logs:");
  logger.info("   Proxy: bft proxy --logs");
  logger.info("   Dev server: tail -f /tmp/boltfoundry-com-dev.log");

  return 0;
}

export const bftDefinition = {
  description:
    "Start essential container services (HTTPS proxy and dev server)",
  fn: containerStartup,
} satisfies TaskDefinition;
