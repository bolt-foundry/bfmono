#!/usr/bin/env -S bft run

import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { formatEnvFile, parseEnvFile } from "@bfmono/packages/env/utils.ts";

const logger = getLogger(import.meta);

// Tag constants for 1Password
const BF_PUBLIC_CONFIG = "BF_PUBLIC_CONFIG";
const BF_PRIVATE_SECRET = "BF_PRIVATE_SECRET";
const _BF_VAULT_CONFIG = "BF_VAULT_CONFIG";

export const bftDefinition = {
  description: "Manage site variables (config and secrets)",
  fn: sitevarTask,
} satisfies TaskDefinition;

async function sitevarTask(args: Array<string>): Promise<number> {
  if (args.length === 0) {
    ui.error("Usage: bft sitevar <command> [args...]");
    ui.info("Commands:");
    ui.info(
      "  sync                 - Sync all variables to .env.config and .env.secrets",
    );
    ui.info(
      "  sync --config-only   - Sync only config variables to .env.config",
    );
    ui.info(
      "  sync --secret-only   - Sync only secret variables to .env.secrets",
    );
    ui.info(
      "  sync --vault <name>  - Sync from specific vault (development, ci, production)",
    );
    ui.info(
      "  list                 - List all available environment variables",
    );
    ui.info(
      "  generate-types       - Generate TypeScript definitions from example files",
    );
    ui.info(
      "  config set <key> <value>    - Set a config variable (safe for browser)",
    );
    ui.info(
      "  config get <key>            - Get a config variable",
    );
    ui.info(
      "  config remove <key>         - Remove a config variable",
    );
    ui.info(
      "  secret set <key> <value>    - Set a secret variable (backend only)",
    );
    ui.info(
      "  secret get <key>            - Get a secret variable",
    );
    ui.info(
      "  secret remove <key>         - Remove a secret variable",
    );
    return 1;
  }

  const subcommand = args[0];
  const commandArgs = args.slice(1);

  switch (subcommand) {
    case "sync":
      return await syncSitevarsFromOnePassword(commandArgs);
    case "list":
      return await listAvailableSitevars();
    case "generate-types":
      return await generateTypes();
    case "config":
      return await handleConfigCommand(commandArgs);
    case "secret":
      return await handleSecretCommand(commandArgs);
    default:
      ui.error(`Unknown command: ${subcommand}`);
      return 1;
  }
}

async function handleConfigCommand(args: Array<string>): Promise<number> {
  if (args.length === 0) {
    ui.error("Usage: bft sitevar config <subcommand>");
    ui.info("Subcommands:");
    ui.info("  set <key> <value> - Set a config variable");
    ui.info("  get <key>         - Get a config variable");
    ui.info("  remove <key>      - Remove a config variable");
    return 1;
  }

  const subcommand = args[0];
  const subArgs = args.slice(1);

  switch (subcommand) {
    case "set":
      // Force BF_PUBLIC_CONFIG tag
      return await setSitevar([...subArgs, "--tag", BF_PUBLIC_CONFIG]);
    case "get":
      return await getConfigVar(subArgs);
    case "remove":
      return await removeSitevar(subArgs);
    default:
      ui.error(`Unknown config subcommand: ${subcommand}`);
      return 1;
  }
}

async function handleSecretCommand(args: Array<string>): Promise<number> {
  if (args.length === 0) {
    ui.error("Usage: bft sitevar secret <subcommand>");
    ui.info("Subcommands:");
    ui.info("  set <key> <value> - Set a secret variable");
    ui.info("  get <key>         - Get a secret variable");
    ui.info("  remove <key>      - Remove a secret variable");
    return 1;
  }

  const subcommand = args[0];
  const subArgs = args.slice(1);

  switch (subcommand) {
    case "set":
      // Force BF_PRIVATE_SECRET tag
      return await setSitevar([...subArgs, "--tag", BF_PRIVATE_SECRET]);
    case "get":
      return await getSecretVar(subArgs);
    case "remove":
      return await removeSitevar(subArgs);
    default:
      ui.error(`Unknown secret subcommand: ${subcommand}`);
      return 1;
  }
}

async function syncSitevarsFromOnePassword(
  args: Array<string>,
): Promise<number> {
  const configOnly = args.includes("--config-only");
  const secretOnly = args.includes("--secret-only");
  const force = args.includes("--force");

  // Parse vault flag
  const vaultFlagIndex = args.indexOf("--vault");
  const vaultFromFlag = vaultFlagIndex !== -1 && args[vaultFlagIndex + 1]
    ? args[vaultFlagIndex + 1]
    : null;

  // Read variable names from example files
  const configKeys = await getExampleKeys(".env.config.example");
  const secretKeys = await getExampleKeys(".env.secrets.example");

  if (configKeys.length === 0 && secretKeys.length === 0) {
    ui.error(
      "No .env.example files found. Create .env.config.example and .env.secrets.example first.",
    );
    return 1;
  }

  // Check if target files exist and --force not used
  const filesToCheck = configOnly
    ? [".env.config"]
    : secretOnly
    ? [".env.secrets"]
    : [".env.config", ".env.secrets"];

  if (!force) {
    for (const file of filesToCheck) {
      try {
        await Deno.stat(file);
        ui.error(`${file} already exists. Use --force to overwrite.`);
        return 1;
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    }
  }

  try {
    // Check if 1Password CLI is available
    const opCheck = new Deno.Command("op", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const { code: opCheckCode } = await opCheck.output();

    if (opCheckCode !== 0) {
      logger.warn(
        "1Password CLI not available. Skipping sitevar sync.",
      );
      ui.warn("⚠️  1Password CLI not available");
      ui.info(
        "Install 1Password CLI and run 'bft sitevar sync --force' to populate with real values",
      );

      // Still generate types
      await generateTypes();
      return 0;
    }

    // Get vault ID
    const vaultId = await getVaultId(vaultFromFlag);
    if (!vaultId) {
      ui.error("No vault selected. Set BF_VAULT_ID or use --vault flag.");
      return 1;
    }

    ui.info(`Using vault: ${vaultId}`);

    // Fetch all items with our tags
    const allSitevars = new Map<string, string>();

    // Fetch public config items
    if (!secretOnly) {
      const publicItems = await fetchItemsByTag(vaultId, BF_PUBLIC_CONFIG);
      publicItems.forEach((value, key) => allSitevars.set(key, value));
    }

    // Fetch private secret items
    if (!configOnly) {
      const privateItems = await fetchItemsByTag(vaultId, BF_PRIVATE_SECRET);
      privateItems.forEach((value, key) => allSitevars.set(key, value));
    }

    // Write site variables to appropriate files
    const successCount = await writeEnvFiles(
      allSitevars,
      configKeys,
      secretKeys,
      configOnly,
      secretOnly,
    );

    const filesWritten = configOnly
      ? ".env.config"
      : secretOnly
      ? ".env.secrets"
      : ".env.config and .env.secrets";

    ui.info(`✅ Synced ${successCount} site variables to ${filesWritten}`);

    // Auto-generate TypeScript definitions
    await generateTypes();

    const totalExpected = configOnly
      ? configKeys.length
      : secretOnly
      ? secretKeys.length
      : configKeys.length + secretKeys.length;

    if (successCount < totalExpected) {
      ui.warn(
        `⚠️  ${
          totalExpected - successCount
        } site variables were not found in 1Password`,
      );
    }

    return 0;
  } catch (error) {
    logger.error(
      `Failed to sync site variables: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function getVaultId(
  vaultFromFlag: string | null,
): Promise<string | null> {
  // Priority order: --vault flag, BF_VAULT_ID env var, interactive selection

  if (vaultFromFlag) {
    // Map vault names to IDs if needed
    if (
      vaultFromFlag.toLowerCase() === "development" ||
      vaultFromFlag.toLowerCase() === "dev"
    ) {
      // Try to get development vault UUID from current vault
      const devVaultId = await getVaultUUID("BF_VAULT_UUID_DEVELOPMENT");
      if (devVaultId) return devVaultId;
    } else if (vaultFromFlag.toLowerCase() === "ci") {
      const ciVaultId = await getVaultUUID("BF_VAULT_UUID_CI");
      if (ciVaultId) return ciVaultId;
    } else if (
      vaultFromFlag.toLowerCase() === "production" ||
      vaultFromFlag.toLowerCase() === "prod"
    ) {
      const prodVaultId = await getVaultUUID("BF_VAULT_UUID_PRODUCTION");
      if (prodVaultId) return prodVaultId;
    }
    // If not a known name, assume it's a vault ID
    return vaultFromFlag;
  }

  // Check environment variable
  const vaultId = getConfigurationVariable("BF_VAULT_ID");
  if (vaultId) return vaultId;

  // Interactive selection
  return await selectVault();
}

async function getVaultUUID(key: string): Promise<string | null> {
  try {
    // First need to get the current vault to look up the UUID
    const currentVault = getConfigurationVariable("BF_VAULT_ID") ||
      await selectVault();
    if (!currentVault) return null;

    const cmd = new Deno.Command("op", {
      args: ["read", `op://${currentVault}/${key}/value`],
      stdout: "piped",
      stderr: "piped",
    });

    const result = await cmd.output();
    if (result.code === 0) {
      return new TextDecoder().decode(result.stdout).trim();
    }
  } catch {
    // Ignore errors
  }
  return null;
}

async function fetchItemsByTag(
  vaultId: string,
  tag: string,
): Promise<Map<string, string>> {
  const items = new Map<string, string>();

  try {
    // List items with the specified tag
    const listCmd = new Deno.Command("op", {
      args: [
        "item",
        "list",
        "--vault",
        vaultId,
        "--tags",
        tag,
        "--format=json",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const listResult = await listCmd.output();

    if (listResult.code !== 0) {
      const error = new TextDecoder().decode(listResult.stderr);
      logger.warn(`Failed to list items with tag ${tag}: ${error}`);
      return items;
    }

    const itemList = JSON.parse(new TextDecoder().decode(listResult.stdout));

    // Fetch each item's value
    for (const item of itemList) {
      try {
        const readCmd = new Deno.Command("op", {
          args: ["read", `op://${vaultId}/${item.title}/value`],
          stdout: "piped",
          stderr: "piped",
        });

        const readResult = await readCmd.output();

        if (readResult.code === 0) {
          // Don't trim - preserve whitespace for values like SSH keys
          let value = new TextDecoder().decode(readResult.stdout);

          // 1Password may return escaped values, so unescape them
          // This handles multiline content like SSH keys
          value = value
            .replace(/\\n/g, "\n") // Unescape newlines
            .replace(/\\r/g, "\r") // Unescape carriage returns
            .replace(/\\t/g, "\t") // Unescape tabs
            .replace(/\\\\/g, "\\"); // Unescape backslashes (do this last)

          // Only trim the final newline that 1Password adds
          if (value.endsWith("\n")) {
            value = value.slice(0, -1);
          }

          items.set(item.title, value);
        } else {
          logger.warn(`Failed to read value for ${item.title}`);
        }
      } catch (error) {
        logger.warn(`Error reading ${item.title}: ${error}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to fetch items by tag ${tag}: ${error}`);
  }

  return items;
}

async function getExampleKeys(filePath: string): Promise<Array<string>> {
  try {
    const content = await Deno.readTextFile(filePath);
    return Object.keys(parseEnvFile(content));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.info(`Example file ${filePath} not found`);
      return [];
    }
    throw error;
  }
}

async function writeEnvFiles(
  sitevars: Map<string, string>,
  allConfigKeys: Array<string>,
  allSecretKeys: Array<string>,
  configOnly: boolean,
  secretOnly: boolean,
): Promise<number> {
  let successCount = 0;

  // Write .env.config file
  if (!secretOnly && allConfigKeys.length > 0) {
    const configVars: Record<string, string> = {};
    for (const key of allConfigKeys) {
      const value = sitevars.get(key);
      if (value !== undefined) {
        configVars[key] = value;
        successCount++;
      }
    }

    if (Object.keys(configVars).length > 0) {
      await Deno.writeTextFile(".env.config", formatEnvFile(configVars));
    }
  }

  // Write .env.secrets file
  if (!configOnly && allSecretKeys.length > 0) {
    const secretVars: Record<string, string> = {};
    for (const key of allSecretKeys) {
      const value = sitevars.get(key);
      if (value !== undefined) {
        secretVars[key] = value;
        successCount++;
      }
    }

    if (Object.keys(secretVars).length > 0) {
      await Deno.writeTextFile(".env.secrets", formatEnvFile(secretVars));
    }
  }

  return successCount;
}

async function listAvailableSitevars(): Promise<number> {
  const configKeys = await getExampleKeys(".env.config.example");
  const secretKeys = await getExampleKeys(".env.secrets.example");

  if (configKeys.length === 0 && secretKeys.length === 0) {
    ui.error("No .env.example files found.");
    ui.info(
      "Create .env.config.example and .env.secrets.example to define your environment variables.",
    );
    return 1;
  }

  ui.info("Available environment variables (from .env.example files):");
  ui.info("");

  if (configKeys.length > 0) {
    ui.info("Config variables (safe for browser, from .env.config.example):");
    configKeys.forEach((key) => {
      ui.info(`  ${key}`);
    });
    ui.info("");
  }

  if (secretKeys.length > 0) {
    ui.info("Secret variables (backend only, from .env.secrets.example):");
    secretKeys.forEach((key) => {
      ui.info(`  ${key}`);
    });
    ui.info("");
  }

  const totalKeys = configKeys.length + secretKeys.length;
  ui.info(
    `Total: ${totalKeys} variables (${configKeys.length} config, ${secretKeys.length} secret)`,
  );
  return 0;
}

async function selectVault(): Promise<string | null> {
  try {
    // List available vaults
    const child = new Deno.Command("op", {
      args: ["vault", "list", "--format=json"],
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    const { code, stdout, stderr } = await child.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      logger.error(`Failed to list vaults: ${errorText}`);
      return null;
    }

    const vaults = JSON.parse(new TextDecoder().decode(stdout));

    if (vaults.length === 0) {
      ui.error(
        "No 1Password vaults found. Make sure you're signed in with 'op signin'",
      );
      return null;
    }

    if (vaults.length === 1) {
      ui.info(`Using vault: ${vaults[0].name} (${vaults[0].id})`);
      return vaults[0].id;
    }

    // Interactive selection for multiple vaults
    ui.info("Multiple vaults found. Please select one:");
    // deno-lint-ignore no-explicit-any
    vaults.forEach((v: any, index: number) => {
      ui.info(`  ${index + 1}. ${v.name} (${v.id})`);
    });

    const input = prompt("Enter vault number (1-" + vaults.length + "):");
    const selection = parseInt(input || "0", 10);

    if (selection >= 1 && selection <= vaults.length) {
      const selectedVault = vaults[selection - 1];
      ui.info(`Selected vault: ${selectedVault.name} (${selectedVault.id})`);
      ui.info(
        `To avoid this prompt, set: export BF_VAULT_ID=${selectedVault.id}`,
      );
      return selectedVault.id;
    }

    ui.error("Invalid selection");
    return null;
  } catch (error) {
    logger.error(
      `Failed to select vault: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

async function generateTypes(): Promise<number> {
  try {
    const { generateEnvTypes } = await import(
      "@bfmono/packages/env/generate-types.ts"
    );
    const types = await generateEnvTypes();
    await Deno.writeTextFile("env.d.ts", types);

    // Auto-format the generated file
    const formatCmd = new Deno.Command("deno", {
      args: ["fmt", "env.d.ts"],
      stdout: "piped",
      stderr: "piped",
    });

    const formatResult = await formatCmd.output();
    if (formatResult.code !== 0) {
      const error = new TextDecoder().decode(formatResult.stderr);
      logger.warn(`Failed to format env.d.ts: ${error}`);
    }

    ui.info("✅ Generated environment-aware TypeScript definitions");
    return 0;
  } catch (error) {
    ui.warn(
      `⚠️  Failed to generate TypeScript definitions: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function setSitevar(args: Array<string>): Promise<number> {
  if (args.length < 2) {
    ui.error("Usage: bft sitevar [config|secret] set <key> <value>");
    return 1;
  }

  const [key, value] = args;

  // Escape newlines and other special characters for 1Password
  // This ensures multiline values like SSH keys are stored correctly
  const escapedValue = value
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t"); // Escape tabs

  // Parse tag flag
  const tagFlagIndex = args.indexOf("--tag");
  const tag = tagFlagIndex !== -1 && args[tagFlagIndex + 1]
    ? args[tagFlagIndex + 1]
    : BF_PRIVATE_SECRET; // Default to private

  // Validate tag
  if (tag !== BF_PUBLIC_CONFIG && tag !== BF_PRIVATE_SECRET) {
    ui.error(`Invalid tag. Use ${BF_PUBLIC_CONFIG} or ${BF_PRIVATE_SECRET}`);
    return 1;
  }

  // Get vault ID
  let vaultId = getConfigurationVariable("BF_VAULT_ID");
  if (!vaultId) {
    const selectedVault = await selectVault();
    if (!selectedVault) {
      ui.error("No vault selected. Set BF_VAULT_ID or select interactively.");
      return 1;
    }
    vaultId = selectedVault;
  }

  try {
    // Check if item exists
    const checkCmd = new Deno.Command("op", {
      args: ["item", "get", key, "--vault", vaultId],
      stdout: "piped",
      stderr: "piped",
    });

    const checkResult = await checkCmd.output();

    if (checkResult.code === 0) {
      // Item exists, update it
      const editCmd = new Deno.Command("op", {
        args: [
          "item",
          "edit",
          key,
          `value=${escapedValue}`,
          "--vault",
          vaultId,
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const editResult = await editCmd.output();

      if (editResult.code === 0) {
        ui.info(`✅ Updated site variable ${key} in vault ${vaultId}`);

        // Update tags if needed
        updateItemTags(vaultId, key, tag);

        return 0;
      } else {
        const error = new TextDecoder().decode(editResult.stderr);
        ui.error(`Failed to update site variable: ${error}`);
        return 1;
      }
    } else {
      // Item doesn't exist, create it
      const createCmd = new Deno.Command("op", {
        args: [
          "item",
          "create",
          "--category",
          "Password",
          "--title",
          key,
          `value=${escapedValue}`,
          "--vault",
          vaultId,
          "--tags",
          tag,
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const createResult = await createCmd.output();

      if (createResult.code === 0) {
        ui.info(
          `✅ Created site variable ${key} in vault ${vaultId} with tag ${tag}`,
        );

        // Add to appropriate example file
        const examplePath = tag === BF_PUBLIC_CONFIG
          ? ".env.config.example"
          : ".env.secrets.example";

        try {
          const content = await Deno.readTextFile(examplePath);
          if (!content.includes(`${key}=`)) {
            const newContent = content.trimEnd() +
              `\n${key}=your_${key.toLowerCase()}_here\n`;
            await Deno.writeTextFile(examplePath, newContent);
            ui.info(`Added ${key} to ${examplePath}`);
          }
        } catch (error) {
          if (!(error instanceof Deno.errors.NotFound)) {
            logger.warn(`Could not update ${examplePath}: ${error}`);
          }
        }

        return 0;
      } else {
        const error = new TextDecoder().decode(createResult.stderr);
        ui.error(`Failed to create site variable: ${error}`);
        return 1;
      }
    }
  } catch (error) {
    ui.error(
      `Failed to set site variable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

function updateItemTags(
  _vaultId: string,
  itemName: string,
  tag: string,
): void {
  try {
    // 1Password CLI doesn't have a direct way to update tags,
    // so we'll log a message for now
    logger.info(
      `Note: Tags need to be updated manually in 1Password for ${itemName} to ${tag}`,
    );
  } catch (error) {
    logger.warn(`Could not update tags for ${itemName}: ${error}`);
  }
}

async function getConfigVar(args: Array<string>): Promise<number> {
  if (args.length < 1) {
    ui.error("Usage: bft sitevar config get <key>");
    return 1;
  }

  const [key] = args;

  // Get vault ID
  let vaultId = getConfigurationVariable("BF_VAULT_ID");
  if (!vaultId) {
    const selectedVault = await selectVault();
    if (!selectedVault) {
      ui.error("No vault selected. Set BF_VAULT_ID or select interactively.");
      return 1;
    }
    vaultId = selectedVault;
  }

  try {
    // First, check if the item exists and get its tags
    const itemCmd = new Deno.Command("op", {
      args: ["item", "get", key, "--vault", vaultId, "--format=json"],
      stdout: "piped",
      stderr: "piped",
    });

    const itemResult = await itemCmd.output();

    if (itemResult.code === 0) {
      const item = JSON.parse(new TextDecoder().decode(itemResult.stdout));
      const tags = item.tags || [];

      // Check if it's tagged with the wrong type
      if (tags.includes(BF_PRIVATE_SECRET)) {
        ui.warn(
          `⚠️  Warning: '${key}' is a secret variable, not a config variable.`,
        );
        ui.info(`Use 'bft sitevar secret get ${key}' instead.`);
        return 1;
      }

      // If it has the correct tag (BF_PUBLIC_CONFIG) or no tag, proceed
      // Get the actual value
      const valueCmd = new Deno.Command("op", {
        args: ["read", `op://${vaultId}/${key}/value`],
        stdout: "piped",
        stderr: "piped",
      });

      const valueResult = await valueCmd.output();

      if (valueResult.code === 0) {
        // Don't trim - preserve whitespace for values
        let value = new TextDecoder().decode(valueResult.stdout);

        // 1Password may return escaped values, so unescape them
        value = value
          .replace(/\\n/g, "\n") // Unescape newlines
          .replace(/\\r/g, "\r") // Unescape carriage returns
          .replace(/\\t/g, "\t") // Unescape tabs
          .replace(/\\\\/g, "\\"); // Unescape backslashes (do this last)

        // Only trim the final newline that 1Password adds
        if (value.endsWith("\n")) {
          value = value.slice(0, -1);
        }

        ui.info(value);
        return 0;
      }
    }

    ui.error(`Config variable '${key}' not found.`);
    return 1;
  } catch (error) {
    ui.error(
      `Failed to get config variable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function getSecretVar(args: Array<string>): Promise<number> {
  if (args.length < 1) {
    ui.error("Usage: bft sitevar secret get <key>");
    return 1;
  }

  const [key] = args;

  // Get vault ID
  let vaultId = getConfigurationVariable("BF_VAULT_ID");
  if (!vaultId) {
    const selectedVault = await selectVault();
    if (!selectedVault) {
      ui.error("No vault selected. Set BF_VAULT_ID or select interactively.");
      return 1;
    }
    vaultId = selectedVault;
  }

  try {
    // First, check if the item exists and get its tags
    const itemCmd = new Deno.Command("op", {
      args: ["item", "get", key, "--vault", vaultId, "--format=json"],
      stdout: "piped",
      stderr: "piped",
    });

    const itemResult = await itemCmd.output();

    if (itemResult.code === 0) {
      const item = JSON.parse(new TextDecoder().decode(itemResult.stdout));
      const tags = item.tags || [];

      // Check if it's tagged with the wrong type
      if (tags.includes(BF_PUBLIC_CONFIG)) {
        ui.warn(`⚠️  Warning: '${key}' is a config variable, not a secret.`);
        ui.info(`Use 'bft sitevar config get ${key}' instead.`);
        return 1;
      }

      // If it has the correct tag (BF_PRIVATE_SECRET) or no tag, proceed
      // Get the actual value
      const valueCmd = new Deno.Command("op", {
        args: ["read", `op://${vaultId}/${key}/value`],
        stdout: "piped",
        stderr: "piped",
      });

      const valueResult = await valueCmd.output();

      if (valueResult.code === 0) {
        // Don't trim - preserve whitespace for values
        let value = new TextDecoder().decode(valueResult.stdout);

        // 1Password may return escaped values, so unescape them
        value = value
          .replace(/\\n/g, "\n") // Unescape newlines
          .replace(/\\r/g, "\r") // Unescape carriage returns
          .replace(/\\t/g, "\t") // Unescape tabs
          .replace(/\\\\/g, "\\"); // Unescape backslashes (do this last)

        // Only trim the final newline that 1Password adds
        if (value.endsWith("\n")) {
          value = value.slice(0, -1);
        }

        ui.info(value);
        return 0;
      }
    }

    ui.error(`Secret variable '${key}' not found.`);
    return 1;
  } catch (error) {
    ui.error(
      `Failed to get secret variable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function removeSitevar(args: Array<string>): Promise<number> {
  if (args.length < 1) {
    ui.error("Usage: bft sitevar [config|secret] remove <key>");
    return 1;
  }

  const [key] = args;

  // Get vault ID
  let vaultId = getConfigurationVariable("BF_VAULT_ID");
  if (!vaultId) {
    const selectedVault = await selectVault();
    if (!selectedVault) {
      ui.error("No vault selected. Set BF_VAULT_ID or select interactively.");
      return 1;
    }
    vaultId = selectedVault;
  }

  try {
    // Check if item exists first
    const checkCmd = new Deno.Command("op", {
      args: ["item", "get", key, "--vault", vaultId],
      stdout: "piped",
      stderr: "piped",
    });

    const checkResult = await checkCmd.output();

    if (checkResult.code !== 0) {
      ui.error(`Site variable '${key}' not found.`);
      return 1;
    }

    // Delete the item
    const deleteCmd = new Deno.Command("op", {
      args: ["item", "delete", key, "--vault", vaultId],
      stdout: "piped",
      stderr: "piped",
    });

    const deleteResult = await deleteCmd.output();

    if (deleteResult.code === 0) {
      ui.info(`✅ Removed site variable '${key}' from vault ${vaultId}`);

      // Remove from example files if present
      await removeFromExampleFiles(key);

      return 0;
    } else {
      const error = new TextDecoder().decode(deleteResult.stderr);
      ui.error(`Failed to remove site variable: ${error}`);
      return 1;
    }
  } catch (error) {
    ui.error(
      `Failed to remove site variable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}

async function removeFromExampleFiles(key: string): Promise<void> {
  const exampleFiles = [".env.config.example", ".env.secrets.example"];

  for (const file of exampleFiles) {
    try {
      const content = await Deno.readTextFile(file);
      const lines = content.split("\n");
      const filteredLines = lines.filter((line) => !line.startsWith(`${key}=`));

      if (lines.length !== filteredLines.length) {
        await Deno.writeTextFile(file, filteredLines.join("\n"));
        ui.info(`Removed ${key} from ${file}`);
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        logger.warn(`Could not update ${file}: ${error}`);
      }
    }
  }
}

// When run directly as a script
if (import.meta.main) {
  Deno.exit(await sitevarTask(Deno.args));
}
