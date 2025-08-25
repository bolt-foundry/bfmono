import type { Plugin } from "vite";
import { parseEnvFile } from "./utils.ts";

/**
 * Vite plugin for Bolt Foundry environment variables
 * Loads client-safe variables from .env.config and .env.local
 * Ensures server-only variables never reach the browser
 */
export function boltFoundryEnvPlugin(): Plugin {
  return {
    name: "bolt-foundry-env",
    config(config, { mode }) {
      // Load client-safe variables
      const clientEnv = loadClientEnvironment();

      // Create define replacements for import.meta.env
      const defineEntries: Record<string, string> = {};

      // Add all client environment variables
      for (const [key, value] of Object.entries(clientEnv)) {
        defineEntries[`import.meta.env.${key}`] = JSON.stringify(value);
      }

      // Add standard Vite env variables
      defineEntries["import.meta.env.MODE"] = JSON.stringify(mode);
      defineEntries["import.meta.env.PROD"] = mode === "production"
        ? "true"
        : "false";
      defineEntries["import.meta.env.DEV"] = mode === "development"
        ? "true"
        : "false";
      defineEntries["import.meta.env.SSR"] = "false";
      defineEntries["import.meta.env.BASE_URL"] = JSON.stringify(
        config.base || "/",
      );

      // Merge with existing define config
      config.define = {
        ...config.define,
        ...defineEntries,
      };

      return config;
    },
  };
}

function loadClientEnvironment(): Record<string, string> {
  const clientVars: Record<string, string> = {};

  // IMPORTANT: Only load client-safe files
  // Never load .env.secrets here - it contains secrets!
  const envFiles = [".env.config", ".env.local"];

  for (const file of envFiles) {
    try {
      const content = Deno.readTextFileSync(file);
      const parsed = parseEnvFile(content);
      Object.assign(clientVars, parsed);
    } catch (error) {
      // File doesn't exist, continue
      if (!(error instanceof Deno.errors.NotFound)) {
        // deno-lint-ignore no-console
        console.warn(`Failed to load ${file}:`, error);
      }
    }
  }

  // Also check system environment for overrides
  // But only include variables that are defined in .env.config.example
  try {
    const exampleContent = Deno.readTextFileSync(".env.config.example");
    const exampleVars = parseEnvFile(exampleContent);
    const systemEnv = Deno.env.toObject();

    // Only include system env vars that are in the client example file
    for (const key of Object.keys(exampleVars)) {
      if (key in systemEnv) {
        clientVars[key] = systemEnv[key];
      }
    }
  } catch (_error) {
    // Example file doesn't exist, skip system env filtering
  }

  return clientVars;
}
