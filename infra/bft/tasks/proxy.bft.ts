#!/usr/bin/env -S deno run -A

import { getLogger } from "@bolt-foundry/logger";
import { TaskDefinition } from "../bft.ts";
import { parseArgs } from "@std/cli/parse-args";

const logger = getLogger(import.meta);

// Simple exec utility
async function exec(cmd: string): Promise<{ stdout: string; stderr: string }> {
  const command = new Deno.Command("sh", {
    args: ["-c", cmd],
    stdout: "piped",
    stderr: "piped",
  });

  const output = await command.output();
  const stdout = new TextDecoder().decode(output.stdout);
  const stderr = new TextDecoder().decode(output.stderr);

  return { stdout, stderr };
}

interface ProxyOptions {
  start?: boolean;
  stop?: boolean;
  restart?: boolean;
  status?: boolean;
  logs?: boolean;
  foreground?: boolean;
  _?: string[];
}

async function getProxyProcessInfo() {
  try {
    const { stdout } = await exec(
      "ps aux | grep https-proxy-server.ts | grep -v grep",
    );
    const lines = stdout.trim().split("\n").filter(Boolean);

    if (lines.length === 0) {
      return null;
    }

    // Parse the first matching process
    const parts = lines[0].split(/\s+/);
    return {
      pid: parts[1],
      command: parts.slice(10).join(" "),
      running: true,
    };
  } catch {
    return null;
  }
}

async function stopProxy() {
  const processInfo = await getProxyProcessInfo();

  if (!processInfo) {
    logger.info("HTTPS proxy is not running");
    return;
  }

  logger.info(`Stopping HTTPS proxy (PID: ${processInfo.pid})...`);

  try {
    await exec(`kill ${processInfo.pid}`);

    // Wait for process to terminate
    let attempts = 0;
    while (attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const stillRunning = await getProxyProcessInfo();
      if (!stillRunning) {
        logger.info("HTTPS proxy stopped successfully");
        return;
      }
      attempts++;
    }

    // Force kill if still running
    logger.warn("Process didn't stop gracefully, force killing...");
    await exec(`kill -9 ${processInfo.pid}`);
  } catch (error) {
    logger.error(`Failed to stop proxy: ${error}`);
    throw error;
  }
}

async function startProxy(foreground: boolean = false) {
  // Check if already running
  const existingProcess = await getProxyProcessInfo();
  if (existingProcess) {
    logger.warn(`HTTPS proxy is already running (PID: ${existingProcess.pid})`);
    logger.info("Use 'bft proxy --restart' to restart it");
    return;
  }

  // Check if certificate files exist
  const certPath = "/internalbf/bfmono/shared/certs/codebot-wildcard.pem";
  const keyPath = "/internalbf/bfmono/shared/certs/codebot-wildcard-key.pem";

  try {
    await Deno.stat(certPath);
    await Deno.stat(keyPath);
  } catch {
    logger.error("Certificate files not found!");
    logger.error(`Expected cert at: ${certPath}`);
    logger.error(`Expected key at: ${keyPath}`);
    logger.error("Please generate certificates first");
    Deno.exit(1);
  }

  logger.info("Starting HTTPS proxy server...");

  const proxyScript =
    "/internalbf/bfmono/infra/apps/codebot/https-proxy-server.ts";
  const logFile = "/tmp/https-proxy.log";

  if (foreground) {
    // Run in foreground
    logger.info("Running in foreground mode (Ctrl+C to stop)");

    const command = new Deno.Command("authbind", {
      args: [
        "--deep",
        "deno",
        "run",
        "--allow-net",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        proxyScript,
      ],
      cwd: "/internalbf/bfmono",
      stdout: "inherit",
      stderr: "inherit",
    });

    const process = command.spawn();
    await process.status;
  } else {
    // Run in background
    const command =
      `cd /internalbf/bfmono && nohup authbind --deep deno run --allow-net --allow-read --allow-write --allow-env ${proxyScript} > ${logFile} 2>&1 &`;

    await exec(command);

    // Wait for startup
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if started successfully
    const processInfo = await getProxyProcessInfo();
    if (processInfo) {
      logger.info(`HTTPS proxy started successfully (PID: ${processInfo.pid})`);
      logger.info(`Logs: ${logFile}`);
      logger.info("Access your apps at https://*.codebot.local");
    } else {
      logger.error("Failed to start HTTPS proxy");
      logger.error(`Check logs at: ${logFile}`);

      // Show last few lines of log
      try {
        const { stdout } = await exec(`tail -20 ${logFile}`);
        logger.error("Recent logs:");
        logger.error(stdout);
      } catch {
        // Ignore errors reading log
      }

      Deno.exit(1);
    }
  }
}

async function showProxyStatus() {
  const processInfo = await getProxyProcessInfo();

  if (processInfo) {
    logger.info(`HTTPS proxy is running (PID: ${processInfo.pid})`);
    logger.info(`Command: ${processInfo.command}`);
  } else {
    logger.info("HTTPS proxy is not running");
  }
}

async function showProxyLogs() {
  const logFile = "/tmp/https-proxy.log";

  try {
    await Deno.stat(logFile);
    const { stdout } = await exec(`tail -50 ${logFile}`);
    console.log(stdout);
  } catch {
    logger.error(`No log file found at: ${logFile}`);
  }
}

async function proxy(rawArgs: string[]) {
  const args = parseArgs<ProxyOptions>(rawArgs, {
    boolean: ["start", "stop", "restart", "status", "logs", "foreground"],
    alias: {
      f: "foreground",
    },
  });

  // Default to status if no action specified
  const actionCount =
    [args.start, args.stop, args.restart, args.status, args.logs]
      .filter(Boolean).length;

  if (actionCount === 0) {
    args.status = true;
  } else if (actionCount > 1) {
    logger.error(
      "Please specify only one action: --start, --stop, --restart, --status, or --logs",
    );
    Deno.exit(1);
  }

  if (args.stop) {
    await stopProxy();
  } else if (args.start) {
    await startProxy(args.foreground);
  } else if (args.restart) {
    await stopProxy();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await startProxy(args.foreground);
  } else if (args.status) {
    await showProxyStatus();
  } else if (args.logs) {
    await showProxyLogs();
  }
}

export const bftDefinition = {
  description: "Manage HTTPS proxy server for local development",
  fn: proxy,
} satisfies TaskDefinition;
