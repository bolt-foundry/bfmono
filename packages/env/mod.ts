import { getConfigurationVariable } from "../get-configuration-var/get-configuration-var.ts";
import { parseEnvFile } from "./utils.ts";

// Cache for loaded environment variables
let envCache: Record<string, string | undefined> | null = null;

/**
 * Load environment variables from files if not already cached
 */
function loadEnv(): Record<string, string | undefined> {
  if (envCache !== null) {
    return envCache;
  }

  envCache = {};

  // Load .env files in priority order (lowest to highest)
  const envFiles = [".env.config", ".env.secrets", ".env.local"];

  for (const file of envFiles) {
    try {
      const content = Deno.readTextFileSync(file);
      Object.assign(envCache, parseEnvFile(content));
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  return envCache;
}

/**
 * Get an environment variable value
 * Checks in order:
 * 1. import.meta.env (if available)
 * 2. Deno.env.get()
 * 3. Loaded .env files
 */
function getEnvValue(key: string): string | undefined {
  // First check import.meta.env if it exists
  if (typeof import.meta !== "undefined" && "env" in import.meta) {
    // deno-lint-ignore no-explicit-any
    const value = (import.meta as any).env[key];
    if (value !== undefined) {
      return value;
    }
  }

  // Then check system environment
  if (typeof Deno !== "undefined") {
    const value = getConfigurationVariable(key);
    if (value !== undefined) {
      return value;
    }
  }

  // Finally check loaded .env files
  const loaded = loadEnv();
  return loaded[key];
}

/**
 * Environment variable proxy that provides clean access to all env vars
 *
 * @example
 * ```ts
 * import { env } from "@bfmono/packages/env/mod.ts";
 *
 * const apiKey = env.OPENAI_API_KEY;
 * const isProd = env.PROD;
 * const logLevel = env.LOG_LEVEL ?? "info";
 * ```
 */
type EnvRecord = Record<string, string | boolean | undefined>;

export const env: EnvRecord = new Proxy<EnvRecord>({}, {
  get(_target, key: string): string | boolean | undefined {
    // Handle special computed properties
    if (key === "MODE") {
      return getEnvValue("NODE_ENV") || getEnvValue("DENO_ENV") ||
        "development";
    }
    if (key === "PROD") {
      const mode = getEnvValue("NODE_ENV") || getEnvValue("DENO_ENV") ||
        "development";
      return mode === "production";
    }
    if (key === "DEV") {
      const mode = getEnvValue("NODE_ENV") || getEnvValue("DENO_ENV") ||
        "development";
      return mode !== "production";
    }
    if (key === "SSR") {
      return typeof Deno !== "undefined";
    }
    if (key === "BASE_URL") {
      return getEnvValue("BASE_URL") || "/";
    }

    // Get the raw value
    const value = getEnvValue(key);

    // Convert string booleans to actual booleans
    if (value === "true") return true;
    if (value === "false") return false;

    return value;
  },

  has(_target, key: string): boolean {
    // Check special keys first
    if (["MODE", "PROD", "DEV", "SSR", "BASE_URL"].includes(key)) {
      return true;
    }
    return getEnvValue(key) !== undefined;
  },

  ownKeys(): Array<string | symbol> {
    // Return all available environment variable keys
    const keys = new Set<string>();

    // Add import.meta.env keys if available
    if (typeof import.meta !== "undefined" && "env" in import.meta) {
      // deno-lint-ignore no-explicit-any
      Object.keys((import.meta as any).env).forEach((k) => keys.add(k));
    }

    // Add system env keys
    if (typeof Deno !== "undefined") {
      Object.keys(Deno.env.toObject()).forEach((k) => keys.add(k));
    }

    // Add loaded .env file keys
    Object.keys(loadEnv()).forEach((k) => keys.add(k));

    // Add special keys
    ["MODE", "PROD", "DEV", "SSR", "BASE_URL"].forEach((k) => keys.add(k));

    return Array.from(keys);
  },

  getOwnPropertyDescriptor(
    _target,
    key: string,
  ): PropertyDescriptor | undefined {
    // Check special keys first
    if (["MODE", "PROD", "DEV", "SSR", "BASE_URL"].includes(key)) {
      return {
        enumerable: true,
        configurable: true,
        value: env[key],
      };
    }
    // Check if the env var exists
    if (getEnvValue(key) !== undefined) {
      return {
        enumerable: true,
        configurable: true,
        value: env[key],
      };
    }
    return undefined;
  },
});

// Re-export utilities
export { formatEnvFile, parseEnvFile } from "./utils.ts";

// Re-export types
export type { ImportMetaEnv } from "./types.ts";
