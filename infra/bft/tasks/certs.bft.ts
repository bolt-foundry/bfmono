#!/usr/bin/env -S deno run -A

import { getLogger } from "@bolt-foundry/logger";
import type { TaskDefinition } from "../bft.ts";
import { parseArgs } from "@std/cli/parse-args";
import type { Args } from "@std/cli/parse-args";
import {
  ensureWildcardCertificate,
  removeOldCodebotCertificates,
  trustCertificate,
} from "@bfmono/infra/apps/codebot/cert-utils.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";

const logger = getLogger(import.meta);

interface CertsOptions extends Args {
  generate?: boolean;
  status?: boolean;
  regenerate?: boolean;
  clean?: boolean;
}

async function generateCertificates(): Promise<void> {
  logger.info("🔐 Generating wildcard certificates for *.codebot.local...");

  // Get BF_ROOT directory and create cert path
  const bfRoot = getConfigurationVariable("BF_ROOT") ||
    getConfigurationVariable("HOME") + "/internalbf/bfmono";
  const sharedCertDir = `${bfRoot}/shared/certs`;

  logger.info(`Certificate directory: ${sharedCertDir}`);

  try {
    await ensureWildcardCertificate(sharedCertDir);
    logger.info("✅ Certificate generation completed successfully");
  } catch (error) {
    logger.error(`❌ Certificate generation failed: ${error}`);
    throw error;
  }
}

async function checkCertificateStatus(): Promise<void> {
  const bfRoot = getConfigurationVariable("BF_ROOT") ||
    getConfigurationVariable("HOME") + "/internalbf/bfmono";
  const sharedCertDir = `${bfRoot}/shared/certs`;
  const certPath = `${sharedCertDir}/codebot-wildcard.pem`;
  const keyPath = `${sharedCertDir}/codebot-wildcard-key.pem`;

  logger.info("📋 Certificate Status:");
  logger.info(`Certificate directory: ${sharedCertDir}`);

  try {
    const certStat = await Deno.stat(certPath);
    const keyStat = await Deno.stat(keyPath);

    logger.info(`✅ Certificate file exists: ${certPath}`);
    logger.info(`   Created: ${certStat.birthtime || certStat.mtime}`);
    logger.info(`✅ Private key exists: ${keyPath}`);
    logger.info(`   Created: ${keyStat.birthtime || keyStat.mtime}`);
  } catch {
    logger.info("❌ Certificate files not found");
    logger.info(`   Expected cert: ${certPath}`);
    logger.info(`   Expected key: ${keyPath}`);
    logger.info("💡 Run 'bft certs --generate' to create certificates");
  }
}

async function regenerateCertificates(): Promise<void> {
  logger.info("🔄 Regenerating certificates (removing existing ones)...");

  const bfRoot = getConfigurationVariable("BF_ROOT") ||
    getConfigurationVariable("HOME") + "/internalbf/bfmono";
  const sharedCertDir = `${bfRoot}/shared/certs`;
  const certPath = `${sharedCertDir}/codebot-wildcard.pem`;
  const keyPath = `${sharedCertDir}/codebot-wildcard-key.pem`;

  // Remove existing certificates
  try {
    await Deno.remove(certPath);
    logger.info("🗑️  Removed existing certificate");
  } catch {
    // File didn't exist
  }

  try {
    await Deno.remove(keyPath);
    logger.info("🗑️  Removed existing private key");
  } catch {
    // File didn't exist
  }

  // Remove old certificates from system keychain
  await removeOldCodebotCertificates();

  // Generate new ones
  await generateCertificates();

  // Trust the newly generated certificate
  const newCertPath = `${sharedCertDir}/codebot-wildcard.pem`;
  await trustCertificate(newCertPath);
}

async function cleanCertificates(): Promise<void> {
  logger.info("🧹 Cleaning all codebot certificates...");

  const bfRoot = getConfigurationVariable("BF_ROOT") ||
    getConfigurationVariable("HOME") + "/internalbf/bfmono";
  const sharedCertDir = `${bfRoot}/shared/certs`;
  const cleanCertPath = `${sharedCertDir}/codebot-wildcard.pem`;
  const cleanKeyPath = `${sharedCertDir}/codebot-wildcard-key.pem`;

  // Remove from system keychain first
  await removeOldCodebotCertificates();

  // Remove certificate files
  try {
    await Deno.remove(cleanCertPath);
    logger.info("🗑️  Removed certificate file");
  } catch {
    logger.info("Certificate file not found (already clean)");
  }

  try {
    await Deno.remove(cleanKeyPath);
    logger.info("🗑️  Removed private key file");
  } catch {
    logger.info("Private key file not found (already clean)");
  }

  logger.info("✅ Certificate cleanup completed");
}

async function certs(rawArgs: Array<string>): Promise<number> {
  const args = parseArgs(rawArgs, {
    boolean: ["generate", "status", "regenerate", "clean"],
  }) as CertsOptions;

  // Default to status if no action specified
  const actionCount = [args.generate, args.status, args.regenerate, args.clean]
    .filter(Boolean).length;

  if (actionCount === 0) {
    args.status = true;
  } else if (actionCount > 1) {
    logger.error(
      "Please specify only one action: --generate, --status, --regenerate, or --clean",
    );
    return 1;
  }

  try {
    if (args.generate) {
      await generateCertificates();
    } else if (args.regenerate) {
      await regenerateCertificates();
    } else if (args.clean) {
      await cleanCertificates();
    } else if (args.status) {
      await checkCertificateStatus();
    }
    return 0;
  } catch (error) {
    logger.error(`Command failed: ${error}`);
    return 1;
  }
}

export const bftDefinition = {
  description: "Manage wildcard certificates for *.codebot.local domains",
  fn: certs,
} satisfies TaskDefinition;
