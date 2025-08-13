#! /usr/bin/env -S bff

import { register } from "@bfmono/infra/bff/bff.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import {
  getConfigurationVariable,
  getSecret,
  warmSecrets,
} from "@bolt-foundry/get-configuration-var";
// Config keys import removed - deprecated functionality
const PRIVATE_CONFIG_KEYS: Array<string> = [];
const PUBLIC_CONFIG_KEYS: Array<string> = [];
import { dirname } from "@std/path";
import { exists } from "@std/fs";

const logger = getLogger(import.meta);

// Cache configuration
const CACHE_FILE = getConfigurationVariable("BF_SECRETS_CACHE_FILE") ||
  ".env.local";
const CACHE_TTL_SEC = Number(
  getConfigurationVariable("BF_CACHE_TTL_SEC") || "300",
);

async function isCacheValid(filePath: string): Promise<boolean> {
  try {
    if (!await exists(filePath)) return false;

    const stat = await Deno.stat(filePath);
    const ageInSeconds = (Date.now() - stat.mtime!.getTime()) / 1000;

    return ageInSeconds < CACHE_TTL_SEC;
  } catch {
    return false;
  }
}

async function loadCachedSecrets(): Promise<Record<string, string> | null> {
  if (!await isCacheValid(CACHE_FILE)) {
    return null;
  }

  try {
    const content = await Deno.readTextFile(CACHE_FILE);
    const secrets: Record<string, string> = {};

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (key) {
        secrets[key] = valueParts.join("=");
      }
    }

    return secrets;
  } catch {
    return null;
  }
}

async function ensureCacheDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (dir && dir !== "." && dir !== "/") {
    await Deno.mkdir(dir, { recursive: true });
  }
}

register(
  "secrets:inject",
  "inject 1Password secrets into current shell environment",
  async () => {
    const allKeys = [...PUBLIC_CONFIG_KEYS, ...PRIVATE_CONFIG_KEYS];
    const exportCommands: Array<string> = [];
    let usingCache = false;

    // Try to load from cache first
    const cached = await loadCachedSecrets();
    if (cached) {
      logger.info(`Loading secrets from cache (${CACHE_FILE})`);
      usingCache = true;

      // Build export commands from cache
      for (const key of allKeys) {
        const value = cached[key];
        if (value) {
          // Escape single quotes in the value
          const escapedValue = value.replace(/'/g, "'\\''");
          exportCommands.push(`export ${key}='${escapedValue}'`);
        }
      }
    } else {
      logger.info("Fetching secrets from 1Password...");

      // Warm the cache first
      await warmSecrets();

      // Build export commands and prepare cache content
      const cacheLines: Array<string> = [
        `# Bolt Foundry secrets cache`,
        `# Generated at ${new Date().toISOString()}`,
        `# TTL: ${CACHE_TTL_SEC} seconds`,
        ``,
      ];

      for (const key of allKeys) {
        const value = getSecret(key);
        if (value) {
          // Escape single quotes for shell export
          const escapedValue = value.replace(/'/g, "'\\''");
          exportCommands.push(`export ${key}='${escapedValue}'`);

          // Add to cache lines (no escaping needed for .env format)
          cacheLines.push(`${key}=${value}`);
        }
      }

      // Write to cache file
      try {
        await ensureCacheDir(CACHE_FILE);
        await Deno.writeTextFile(CACHE_FILE, cacheLines.join("\n") + "\n");
        logger.info(`Secrets cached to ${CACHE_FILE}`);
      } catch (error) {
        logger.warn(`Failed to write cache file: ${error}`);
      }
    }

    if (exportCommands.length === 0) {
      logger.warn("No secrets found to export");
      return 0;
    }

    logger.info(
      `Found ${exportCommands.length} secrets${
        usingCache ? " (from cache)" : ""
      }`,
    );

    // Output the export commands
    logger.println("\n# Run the following command to inject secrets:");
    logger.println(`# eval "$(bff secrets:inject --export)"`);
    logger.println("\n# Or copy and paste these commands:");
    exportCommands.forEach((cmd) => logger.println(cmd));

    return 0;
  },
);

register(
  "secrets:inject --export",
  "output shell export commands for secrets (for eval)",
  async () => {
    const allKeys = [...PUBLIC_CONFIG_KEYS, ...PRIVATE_CONFIG_KEYS];

    // Try to load from cache first
    const cached = await loadCachedSecrets();
    if (cached) {
      // Output export commands from cache
      for (const key of allKeys) {
        const value = cached[key];
        if (value) {
          // Escape single quotes in the value
          const escapedValue = value.replace(/'/g, "'\\''");
          // deno-lint-ignore no-console
          console.log(`export ${key}='${escapedValue}'`);
        }
      }
    } else {
      // Warm the cache first
      await warmSecrets();

      // Build cache content while outputting
      const cacheLines: Array<string> = [
        `# Bolt Foundry secrets cache`,
        `# Generated at ${new Date().toISOString()}`,
        `# TTL: ${CACHE_TTL_SEC} seconds`,
        ``,
      ];

      // Output export commands directly for eval
      for (const key of allKeys) {
        const value = getSecret(key);
        if (value) {
          // Escape single quotes in the value
          const escapedValue = value.replace(/'/g, "'\\''");
          // deno-lint-ignore no-console
          console.log(`export ${key}='${escapedValue}'`);

          // Add to cache lines
          cacheLines.push(`${key}=${value}`);
        }
      }

      // Write to cache file
      try {
        await ensureCacheDir(CACHE_FILE);
        await Deno.writeTextFile(CACHE_FILE, cacheLines.join("\n") + "\n");
      } catch {
        // Silently fail - don't disrupt eval output
      }
    }

    return 0;
  },
);

register(
  "secrets:env",
  "write secrets to .env file",
  (_args) => {
    logger.error(
      "This command is deprecated. Use 'bff inject-secrets' to create .env.local",
    );
    return 1;
  },
);

register(
  "secrets:list",
  "list available configuration keys",
  () => {
    logger.info("Public configuration keys:");
    PUBLIC_CONFIG_KEYS.forEach((key) => logger.println(`  ${key}`));

    logger.info("\nPrivate configuration keys:");
    PRIVATE_CONFIG_KEYS.forEach((key) => logger.println(`  ${key}`));

    logger.println(
      `\nTotal: ${PUBLIC_CONFIG_KEYS.length + PRIVATE_CONFIG_KEYS.length} keys`,
    );
    return 0;
  },
);

register(
  "with-secrets",
  "run a command with secrets injected into environment",
  async (args) => {
    if (args.length === 0) {
      logger.error("Usage: bff with-secrets <command> [args...]");
      return 1;
    }

    const allKeys = [...PUBLIC_CONFIG_KEYS, ...PRIVATE_CONFIG_KEYS];
    const env: Record<string, string> = { ...Deno.env.toObject() };

    // Try to load from cache first
    const cached = await loadCachedSecrets();
    if (cached) {
      logger.info(`Loading secrets from cache (${CACHE_FILE})`);

      // Add cached secrets to environment
      for (const key of allKeys) {
        const value = cached[key];
        if (value && !env[key]) { // Don't override existing env vars
          env[key] = value;
        }
      }
    } else {
      logger.info("Loading secrets from 1Password...");

      // Warm all secrets first
      await warmSecrets();

      // Build cache content while adding to env
      const cacheLines: Array<string> = [
        `# Bolt Foundry secrets cache`,
        `# Generated at ${new Date().toISOString()}`,
        `# TTL: ${CACHE_TTL_SEC} seconds`,
        ``,
      ];

      // Build environment with secrets
      for (const key of allKeys) {
        const value = getSecret(key);
        if (value) {
          env[key] = value;
          cacheLines.push(`${key}=${value}`);
        }
      }

      // Write to cache file
      try {
        await ensureCacheDir(CACHE_FILE);
        await Deno.writeTextFile(CACHE_FILE, cacheLines.join("\n") + "\n");
        logger.info(`Secrets cached to ${CACHE_FILE}`);
      } catch (error) {
        logger.warn(`Failed to write cache file: ${error}`);
      }
    }

    // Run the command with injected environment
    const command = new Deno.Command(args[0], {
      args: args.slice(1),
      env,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await command.output();
    return code;
  },
);

register(
  "secrets:install-shell",
  "install shell initialization for automatic secret injection",
  async () => {
    const installScript = new URL(
      "../../../packages/get-configuration-var/scripts/install-shell-init.sh",
      import.meta.url,
    ).pathname;

    const command = new Deno.Command("bash", {
      args: [installScript],
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await command.output();
    return code;
  },
);

register(
  "secrets:cache:refresh",
  "force refresh of the secrets cache",
  async () => {
    logger.info(`Refreshing secrets cache (${CACHE_FILE})...`);

    const allKeys = [...PUBLIC_CONFIG_KEYS, ...PRIVATE_CONFIG_KEYS];

    // Force fetch from 1Password
    await warmSecrets();

    // Build cache content
    const cacheLines: Array<string> = [
      `# Bolt Foundry secrets cache`,
      `# Generated at ${new Date().toISOString()}`,
      `# TTL: ${CACHE_TTL_SEC} seconds`,
      ``,
    ];

    let secretCount = 0;
    for (const key of allKeys) {
      const value = getSecret(key);
      if (value) {
        cacheLines.push(`${key}=${value}`);
        secretCount++;
      }
    }

    // Write to cache file
    try {
      await ensureCacheDir(CACHE_FILE);
      await Deno.writeTextFile(CACHE_FILE, cacheLines.join("\n") + "\n");
      logger.info(`✅ Cache refreshed with ${secretCount} secrets`);
      logger.info(`Cache location: ${CACHE_FILE}`);
      logger.info(`Cache TTL: ${CACHE_TTL_SEC} seconds`);
    } catch (error) {
      logger.error(`Failed to write cache file: ${error}`);
      return 1;
    }

    return 0;
  },
);

register(
  "secrets:cache:info",
  "show information about the secrets cache",
  async () => {
    logger.info(`Cache file: ${CACHE_FILE}`);
    logger.info(`Cache TTL: ${CACHE_TTL_SEC} seconds`);

    try {
      const stat = await Deno.stat(CACHE_FILE);
      const ageInSeconds = Math.floor(
        (Date.now() - stat.mtime!.getTime()) / 1000,
      );
      const isValid = await isCacheValid(CACHE_FILE);

      logger.info(`Cache exists: yes`);
      logger.info(`Cache age: ${ageInSeconds} seconds`);
      logger.info(`Cache valid: ${isValid ? "yes" : "no (expired)"}`);

      // Count secrets in cache
      const cached = await loadCachedSecrets();
      if (cached) {
        const secretCount = Object.keys(cached).length;
        logger.info(`Cached secrets: ${secretCount}`);
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        logger.info(`Cache exists: no`);
      } else {
        logger.error(`Error checking cache: ${error}`);
      }
    }

    logger.info(`\nEnvironment variables:`);
    logger.info(
      `  BF_SECRETS_CACHE_FILE: ${
        getConfigurationVariable("BF_SECRETS_CACHE_FILE") ||
        "(not set, using default)"
      }`,
    );
    logger.info(
      `  BF_CACHE_TTL_SEC: ${
        getConfigurationVariable("BF_CACHE_TTL_SEC") ||
        "(not set, using default)"
      }`,
    );

    return 0;
  },
);

register(
  "secrets:vaults",
  "list available 1Password vaults and help set BF_VAULT_ID",
  async () => {
    logger.info("Listing available 1Password vaults...\n");

    const command = new Deno.Command("op", {
      args: ["vault", "list", "--format=json"],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await command.output();
    if (!success) {
      logger.error(
        `Failed to list vaults: ${new TextDecoder().decode(stderr)}`,
      );
      return 1;
    }

    const vaults = JSON.parse(new TextDecoder().decode(stdout)) as Array<{
      id: string;
      name: string;
    }>;

    // Check if BF_VAULT_ID is set
    const currentVaultId = getConfigurationVariable("BF_VAULT_ID");
    if (currentVaultId) {
      const currentVault = vaults.find((v) => v.id === currentVaultId);
      logger.info(
        `Current vault: ${currentVault?.name || "Unknown"} (${currentVaultId})`,
      );
      logger.println("");
    }

    // List all vaults
    logger.println("Available vaults:");
    vaults.forEach((vault, index) => {
      const isBF = vault.name.toLowerCase().match(/bolt|foundry|bf/);
      const marker = isBF ? " (likely Bolt Foundry)" : "";
      logger.println(`  ${index + 1}. ${vault.name}${marker}`);
      logger.println(`     ID: ${vault.id}`);
    });

    logger.println("\nTo set a specific vault:");
    logger.println("  export BF_VAULT_ID=<vault-id>");
    logger.println("\nOr add to your shell RC file:");
    logger.println('  echo "export BF_VAULT_ID=<vault-id>" >> ~/.zshrc');

    return 0;
  },
);
