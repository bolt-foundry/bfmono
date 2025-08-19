#!/usr/bin/env -S bft run

import * as yaml from "@std/yaml";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { parseEnvFile } from "@bfmono/packages/env/utils.ts";
import type { TaskDefinition } from "../bft.ts";

const logger = getLogger(import.meta);

export const bftDefinition = {
  description: "Validate Kamal config has all required secrets available",
  fn: validateKamalConfig,
} satisfies TaskDefinition;

interface KamalConfig {
  env?: {
    secret?: Array<string>;
  };
  labels?: Record<string, string>;
  accessories?: Record<string, {
    env?: {
      clear?: Record<string, string>;
    };
  }>;
  [key: string]: unknown;
}

async function validateKamalConfig(args: Array<string>): Promise<number> {
  try {
    const configPath = args[0] || "config/deploy.yml";
    const secretsPath = args[1] || ".kamal/secrets";
    const envSecretsPath = ".env.secrets";

    logger.info(`Validating Kamal config at ${configPath}`);

    // Read Kamal config
    const configContent = await Deno.readTextFile(configPath);
    const config = yaml.parse(configContent) as KamalConfig;

    // Extract all secrets referenced in the config
    const requiredSecrets = new Set<string>();

    // Get secrets from env.secret array
    if (config.env?.secret) {
      for (const secret of config.env.secret) {
        requiredSecrets.add(secret);
      }
    }

    // Check for secrets in labels (like HYPERDX_API_KEY)
    if (config.labels) {
      for (const value of Object.values(config.labels)) {
        // Look for ${VAR_NAME} patterns
        const matches = value.match(/\$\{([A-Z_]+)\}/g);
        if (matches) {
          for (const match of matches) {
            const varName = match.slice(2, -1); // Remove ${ and }
            requiredSecrets.add(varName);
          }
        }
      }
    }

    // Check for secrets in accessories
    if (config.accessories) {
      for (const accessory of Object.values(config.accessories)) {
        if (accessory.env?.clear) {
          for (const value of Object.values(accessory.env.clear)) {
            const matches = String(value).match(/\$\{([A-Z_]+)\}/g);
            if (matches) {
              for (const match of matches) {
                const varName = match.slice(2, -1);
                requiredSecrets.add(varName);
              }
            }
          }
        }
      }
    }

    logger.info(
      `Found ${requiredSecrets.size} required secrets in Kamal config`,
    );

    // Check what secrets are available
    const availableSecrets = new Set<string>();
    const missingSecrets = new Set<string>();

    // First check .kamal/secrets if it exists
    try {
      const kamalSecretsContent = await Deno.readTextFile(secretsPath);
      const kamalSecrets = parseEnvFile(kamalSecretsContent);
      for (const key of Object.keys(kamalSecrets)) {
        availableSecrets.add(key);
      }
      logger.info(
        `Found ${Object.keys(kamalSecrets).length} secrets in ${secretsPath}`,
      );
    } catch {
      logger.warn(`${secretsPath} not found, checking ${envSecretsPath}`);
    }

    // Also check .env.secrets for validation during CI
    try {
      const envSecretsContent = await Deno.readTextFile(envSecretsPath);
      const envSecrets = parseEnvFile(envSecretsContent);

      // Simulate what would be in .kamal/secrets based on exclusion rules
      const excludedPatterns = [
        "OP_SERVICE_ACCOUNT_TOKEN",
        "TERRAFORM_BACKEND_ACCESS_KEY_ID",
        "TERRAFORM_BACKEND_SECRET_ACCESS_KEY",
        "TERRAFORM_BACKEND_ENDPOINT",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "SSH_PUBLIC_KEY",
        "SSH_PRIVATE_KEY",
        "HETZNER_API_TOKEN",
        "HETZNER_S3_ACCESS_KEY",
        "HETZNER_S3_SECRET_KEY",
        "CLOUDFLARE_API_TOKEN",
        "CLOUDFLARE_ZONE_ID",
        "CLOUDFLARE_ZONE_ID_PROMPTGRADE",
        "CLOUDFLARE_ZONE_ID_BLTCDN",
        "CLOUDFLARE_ACCOUNT_ID",
        "HETZNER_PROJECT_ID",
        "S3_ENDPOINT",
      ];

      for (const [key] of Object.entries(envSecrets)) {
        // Skip if it matches exclusion patterns
        if (excludedPatterns.includes(key)) continue;
        if (key.endsWith("_SERVER_IP")) continue;
        if (key.startsWith("CLOUDFLARE_")) continue;
        if (key.startsWith("TERRAFORM_")) continue;

        // This would be available in .kamal/secrets
        availableSecrets.add(key);
      }

      logger.info(
        `Found ${availableSecrets.size} runtime secrets that would be in .kamal/secrets`,
      );
    } catch (error) {
      logger.warn(`Could not read ${envSecretsPath}: ${error}`);
    }

    // Add GITHUB_TOKEN which is always added by the deployment script
    availableSecrets.add("GITHUB_TOKEN");

    // Check for missing secrets
    for (const secret of requiredSecrets) {
      if (!availableSecrets.has(secret)) {
        missingSecrets.add(secret);
      }
    }

    // Report results
    if (missingSecrets.size > 0) {
      logger.error(`❌ Missing ${missingSecrets.size} required secrets:`);
      for (const secret of missingSecrets) {
        logger.error(`  - ${secret}`);
      }

      logger.info("\n💡 To fix this:");
      logger.info("1. Add these secrets to 1Password in the production vault");
      logger.info(
        "2. OR update generate-kamal-config.bft.ts to use different variable names",
      );
      logger.info(
        "3. OR ensure these secrets aren't excluded in the deployment workflow",
      );

      return 1;
    }

    logger.info(
      `✅ All ${requiredSecrets.size} required secrets are available`,
    );

    // Additional validation: warn about secrets that exist but aren't used
    const unusedSecrets = new Set<string>();
    for (const secret of availableSecrets) {
      if (!requiredSecrets.has(secret) && secret !== "GITHUB_TOKEN") {
        unusedSecrets.add(secret);
      }
    }

    if (unusedSecrets.size > 0) {
      logger.warn(
        `⚠️  Found ${unusedSecrets.size} unused secrets that would be in .kamal/secrets:`,
      );
      for (const secret of unusedSecrets) {
        logger.warn(`  - ${secret}`);
      }
    }

    return 0;
  } catch (error) {
    logger.error(`Failed to validate Kamal config: ${error}`);
    return 1;
  }
}

// When run directly as a script
if (import.meta.main) {
  const scriptArgs = Deno.args.slice(2); // Skip "run" and script name
  Deno.exit(await validateKamalConfig(scriptArgs));
}
