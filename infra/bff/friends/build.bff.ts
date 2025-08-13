#! /usr/bin/env -S bff

import { runShellCommand } from "@bfmono/infra/bff/shellBase.ts";
import { register } from "@bfmono/infra/bff/bff.ts";
import {
  getConfigurationVariable,
} from "@bfmono/packages/get-configuration-var/get-configuration-var.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { DeploymentEnvs } from "@bfmono/infra/constants/deploymentEnvs.ts";
// Config keys import removed - deprecated functionality
const PRIVATE_CONFIG_KEYS: Array<string> = [];
const PUBLIC_CONFIG_KEYS: Array<string> = [];

const logger = getLogger(import.meta);

export const ENVIRONMENT_ONLY_KEYS = [
  "CI",
  "COLORTERM",
  "DEBUG",
  "DENO_TRACE_PERMISSIONS",
  "FORCE_COLOR",
  "FORCE_DB_BACKEND",
  "NODE_ENV",
  "NODE_PG_FORCE_NATIVE",
  "REPL_HOME",
  "REPL_SLUG",
  "REPLIT_DEV_DOMAIN",
  "SQLITE_DB_PATH",
  "TEAMCITY_VERSION",
  "TERM",
  "TF_BUILD",
  "USER",
  "WS_NO_BUFFER_UTIL",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
];
/** Extra internal keys that _should_ bypass tag-scraping. */
export const INTERNAL_KEYS: Set<string> = new Set<string>([
  "BF_CACHE_TTL_SEC", // 1Password-stored refresh TTL
  "BF_CACHE_ENV", // disable caching (e.g. for tests)
  "BF_ENV",
  "BF_VAULT_ID",
]);
const allowedEnvironmentVariables = [
  ...ENVIRONMENT_ONLY_KEYS,
  ...INTERNAL_KEYS,
  ...PUBLIC_CONFIG_KEYS,
  ...PRIVATE_CONFIG_KEYS,
].reduce((acc, key) => acc.add(key), new Set<string>());

logger.debug("Allowed environment variables:", allowedEnvironmentVariables);

// This part is modified to avoid direct dependency on DATABASE_URL
const DATABASE_STRING = getConfigurationVariable("DATABASE_URL") ?? "";
// Define default network destinations if DATABASE_URL isn't set
const DEFAULT_NETWORK_DESTINATIONS = [
  "0.0.0.0",
  "127.0.0.1",
  "localhost",
  "api.assemblyai.com",
  "openrouter.ai",
  "api.openai.com",
  "app.posthog.com",
  "bf-contacts.replit.app:443",
  "oauth2.googleapis.com:443",
  "api.github.com",
];

const allowedNetworkDestionations = [...DEFAULT_NETWORK_DESTINATIONS];

// Only attempt to parse DATABASE_URL if it exists
if (DATABASE_STRING) {
  try {
    const DATABASE_URL = new URL(DATABASE_STRING);
    const dbDomain = DATABASE_URL.hostname;
    const neonApiParts = dbDomain.split(".");
    neonApiParts[0] = "api";
    const neonApiDomain = neonApiParts.join(".");

    // Add database domains to allowed destinations
    allowedNetworkDestionations.push(dbDomain, neonApiDomain);
  } catch (err) {
    logger.warn(
      "Could not parse DATABASE_URL, continuing with default network destinations",
      err,
    );
  }
}

const includableDirectories = [
  "static",
];

const readableLocations = [
  "/tmp",
  "static/",
  "tmp/",
  "docs/",
];

const writableLocations = [
  "/tmp",
  "tmp",
];

const allowedBinaries = ["op"];

if (getConfigurationVariable("BF_ENV") === DeploymentEnvs.DEVELOPMENT) {
  allowedBinaries.push("sl");
}

const denoCompilationCommand = [
  "deno",
  "compile",
  "--no-check",
  "--output=build/",
  ...includableDirectories.map((dir) => `--include=${dir}`),
  `--allow-net=${allowedNetworkDestionations.join(",")}`,
  `--allow-env=${allowedEnvironmentVariables.entries().toArray().join(",")}`,
  `--allow-read=${readableLocations.join(",")}`,
  `--allow-write=${writableLocations.join(",")}`,
  ...(
    allowedBinaries.length > 0
      ? [`--allow-run=${allowedBinaries.join(",")}`]
      : []
  ),
  "apps/web/web.tsx",
];

// Helper function to format memory usage in MB
function formatMemoryUsage(memoryUsage: Deno.MemoryUsage): string {
  const _formatMB = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;
  return `RSS: ${_formatMB(memoryUsage.rss)} | Heap Total: ${
    _formatMB(memoryUsage.heapTotal)
  } | Heap Used: ${_formatMB(memoryUsage.heapUsed)} | External: ${
    _formatMB(memoryUsage.external)
  }`;
}

// Helper function to get disk usage
async function getDiskUsage(): Promise<
  { total: number; free: number; used: number }
> {
  try {
    const command = new Deno.Command("df", {
      args: ["-k", "."],
      stdout: "piped",
      stderr: "piped",
    });
    const process = command.spawn();
    const { stdout } = await process.output();
    const outputStr = new TextDecoder().decode(stdout);

    // Parse df output (second line, columns 2-4)
    const lines = outputStr.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Unexpected df output format");
    }

    const parts = lines[1].split(/\s+/);
    const total = parseInt(parts[1], 10) * 1024; // Convert from KB to bytes
    const used = parseInt(parts[2], 10) * 1024;
    const free = parseInt(parts[3], 10) * 1024;

    return { total, free, used };
  } catch (error) {
    logger.error("Error getting disk usage:", error);
    return { total: 0, free: 0, used: 0 };
  }
}

// Helper function to format disk usage in MB and GB
function formatDiskUsage(
  diskUsage: { total: number; free: number; used: number },
): string {
  const formatGB = (bytes: number) =>
    `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;

  const usedPercent = diskUsage.total > 0
    ? Math.round((diskUsage.used / diskUsage.total) * 100)
    : 0;

  return `Total: ${formatGB(diskUsage.total)} | Used: ${
    formatGB(diskUsage.used)
  } (${usedPercent}%) | Free: ${formatGB(diskUsage.free)}`;
}

// Helper function to get CPU usage
async function getCpuUsage(): Promise<
  {
    overall: number;
    topProcesses: Array<{ command: string; percentage: number }>;
  }
> {
  try {
    const command = new Deno.Command("top", {
      args: ["-b", "-n", "1"],
      stdout: "piped",
      stderr: "piped",
    });
    const process = command.spawn();
    const { stdout } = await process.output();
    const outputStr = new TextDecoder().decode(stdout);

    // Parse top output
    const lines = outputStr.trim().split("\n");

    // Extract CPU usage from first few lines
    const cpuLine = lines.find((line) => line.includes("Cpu(s)"));
    if (!cpuLine) {
      throw new Error("Could not find CPU usage line in top output");
    }

    // Parse CPU usage percentage (100 - idle%)
    const idleMatch = cpuLine.match(/(\d+\.\d+)\s*id/);
    const idlePercentage = idleMatch ? parseFloat(idleMatch[1]) : 0;
    const cpuUsage = 100 - idlePercentage;

    // Get top CPU processes
    const processStartIndex = lines.findIndex((line) => line.includes("PID")) +
      1;
    const processLines = lines.slice(processStartIndex, processStartIndex + 5);

    const topProcesses: Array<{ command: string; percentage: number }> = [];

    processLines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 12) {
        const percentage = parseFloat(parts[8]);
        const command = parts.slice(11).join(" ");

        if (!isNaN(percentage)) {
          topProcesses.push({ command, percentage });
        }
      }
    });

    return { overall: cpuUsage, topProcesses };
  } catch (error) {
    logger.error("Error getting CPU usage:", error);
    return { overall: 0, topProcesses: [] };
  }
}

// Helper function to format CPU usage
function formatCpuUsage(
  cpuUsage: {
    overall: number;
    topProcesses: Array<{ command: string; percentage: number }>;
  },
): string {
  let result = `Total CPU Usage: ${cpuUsage.overall.toFixed(1)}%`;

  if (cpuUsage.topProcesses.length > 0) {
    result += "\nTop CPU Processes:";
    cpuUsage.topProcesses.forEach((process) => {
      result += `\n  ${process.percentage.toFixed(1)}% - ${
        process.command.substring(0, 50)
      }${process.command.length > 50 ? "..." : ""}`;
    });
  }

  return result;
}

// Helper function to get memory usage from ps aux command
async function getSystemMemoryUsage(): Promise<
  {
    totalPercentage: number;
    topProcesses: Array<{ command: string; percentage: number }>;
  }
> {
  try {
    const command = new Deno.Command("ps", {
      args: ["aux", "--sort", "-pmem"],
      stdout: "piped",
      stderr: "piped",
    });
    const process = command.spawn();
    const { stdout } = await process.output();
    const outputStr = new TextDecoder().decode(stdout);

    // Parse ps aux output
    const lines = outputStr.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Unexpected ps aux output format");
    }

    // Skip header line
    const processLines = lines.slice(1);

    // Calculate total memory usage
    let totalPercentage = 0;
    const topProcesses: Array<{ command: string; percentage: number }> = [];

    for (let i = 0; i < Math.min(5, processLines.length); i++) {
      const line = processLines[i];
      const parts = line.trim().split(/\s+/);

      if (parts.length >= 10) {
        const percentage = parseFloat(parts[3]);
        const command = parts.slice(10).join(" ");

        topProcesses.push({ command, percentage });
      }
    }

    // Sum all memory percentages
    totalPercentage = processLines.reduce((sum, line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        return sum + parseFloat(parts[3]);
      }
      return sum;
    }, 0);

    return { totalPercentage, topProcesses };
  } catch (error) {
    logger.error("Error getting system memory usage:", error);
    return { totalPercentage: 0, topProcesses: [] };
  }
}

// Helper function to format system memory usage
function formatSystemMemoryUsage(
  memoryUsage: {
    totalPercentage: number;
    topProcesses: Array<{ command: string; percentage: number }>;
  },
): string {
  let result = `Total Memory Usage: ${memoryUsage.totalPercentage.toFixed(1)}%`;

  if (memoryUsage.topProcesses.length > 0) {
    result += "\nTop Processes:";
    memoryUsage.topProcesses.forEach((process) => {
      result += `\n  ${process.percentage.toFixed(1)}% - ${
        process.command.substring(0, 50)
      }${process.command.length > 50 ? "..." : ""}`;
    });
  }

  return result;
}

// Helper to log memory usage with a label
function logMemoryUsage(label: string): void {
  const memoryUsage = Deno.memoryUsage();
  logger.info(`Memory usage [${label}]: ${formatMemoryUsage(memoryUsage)}`);
}

// Continuous memory and disk usage logger
let memoryLoggingInterval: number | null = null;

// Start continuous memory and disk usage logging
function startContinuousMemoryLogging(): void {
  if (memoryLoggingInterval !== null) {
    clearInterval(memoryLoggingInterval);
  }

  // Set counter to track elapsed seconds
  let secondsElapsed = 0;

  memoryLoggingInterval = setInterval(async () => {
    secondsElapsed++;
    const memoryUsage = Deno.memoryUsage();
    const diskUsage = await getDiskUsage();
    const systemMemoryUsage = await getSystemMemoryUsage();
    const cpuUsage = await getCpuUsage();

    logger.info(`System usage [${secondsElapsed}s]:`);
    logger.info(`  Process Memory: ${formatMemoryUsage(memoryUsage)}`);
    logger.info(
      `  System Memory: ${
        formatSystemMemoryUsage(systemMemoryUsage).split("\n").join("\n  ")
      }`,
    );
    logger.info(`  CPU: ${formatCpuUsage(cpuUsage).split("\n").join("\n  ")}`);
    logger.info(`  Disk: ${formatDiskUsage(diskUsage)}`);
  }, 1000);
}

// Stop continuous memory logging
function stopContinuousMemoryLogging(): void {
  if (memoryLoggingInterval !== null) {
    clearInterval(memoryLoggingInterval);
    memoryLoggingInterval = null;
  }
}

async function sh(command: string, cwd?: string): Promise<number> {
  const result = await runShellCommand([command], cwd);
  if (result !== 0) {
    throw new Error(`Command "${command}" failed with exit code ${result}`);
  }
  return result;
}

export async function build(args: Array<string>): Promise<number> {
  const waitForFail = args.includes("--slow-exit");
  const debug = args.includes("--debug");
  const skipConfigKeys = args.includes("--skip-config-keys");

  if (debug) {
    logMemoryUsage("build start");
    startContinuousMemoryLogging();
  }

  await Deno.remove("build", { recursive: true }).catch(() => {
    // Ignore errors if directory doesn't exist
  });
  await Deno.mkdir("build", { recursive: true });
  await Deno.writeFile("build/.gitkeep", new Uint8Array());

  await Deno.remove("static/build", { recursive: true }).catch(() => {
    // Ignore errors if directory doesn't exist
  });
  await Deno.mkdir("static/build", { recursive: true });
  await Deno.writeFile("static/build/.gitkeep", new Uint8Array());

  // Build bolt-foundry package only if explicitly requested
  // NOTE: bolt-foundry build script removed - no build.ts file exists

  logger.info("Starting build process");

  // Generate config keys
  if (!skipConfigKeys) {
    logger.info("Generating config keys");
    const genConfigResult = await runShellCommand(["bff", "genConfigKeys"]);
    if (genConfigResult !== 0) {
      logger.warn("Failed to generate config keys, continuing build process");
    }
  } else {
    logger.info(
      "Skipping config keys generation (--skip-config-keys flag provided)",
    );
  }

  // Generate barrel files
  logger.info("Generating barrel files");
  await sh("./apps/bfDb/bin/genBarrel.ts");

  // Routes build removed - appBuild deleted

  // Content build removed for v0.1 - using runtime markdown rendering instead

  if (debug) logMemoryUsage("before graphql types");
  const result = await runShellCommand(["bff", "genGqlTypes"]);
  if (debug) logMemoryUsage("after graphql types");

  if (result) return result;
  if (result && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 15000);
    });
  }

  if (debug) logMemoryUsage("before isograph compiler");
  const isographResult = await runShellCommand(
    ["deno", "run", "-A", "npm:@isograph/compiler"],
    "apps/boltFoundry",
  );
  if (debug) logMemoryUsage("after isograph compiler");

  if (isographResult && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 15000);
    });
  }

  if (debug) logMemoryUsage("before final compilation");
  const denoResult = await runShellCommand(denoCompilationCommand);
  // JS compile removed - appBuild deleted
  if (debug) logMemoryUsage("after final compilation");

  if (denoResult && waitForFail) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Build failed")), 10000);
    });
  }

  if (debug) {
    logMemoryUsage("build complete");
    stopContinuousMemoryLogging();
  } else {
    // Just make sure we stop the logging if it was started
    if (memoryLoggingInterval !== null) {
      stopContinuousMemoryLogging();
    }
  }
  return denoResult;
}

register(
  "build",
  "Builds the current project. Use --debug to show memory and system stats, --slow-exit to wait on failure.",
  build,
  [],
);
