import {
  runShellCommand,
  type runShellCommandWithOutput as _runShellCommandWithOutput,
} from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";

const logger = getLogger(import.meta);

export async function isoCommand(options: Array<string>): Promise<number> {
  logger.info("Running isograph compiler...");

  // Working directories with isograph configs
  const workingDirs = [
    "apps/aibff/gui",
    "apps/boltfoundry-com",
  ];

  let overallResult = 0;

  for (const workingDir of workingDirs) {
    logger.info(`Running isograph compiler in ${workingDir}...`);

    try {
      const result = await runShellCommand(
        ["deno", "run", "-A", "npm:@isograph/compiler", ...options],
        workingDir,
      );

      if (result === 0) {
        logger.info(
          `✅ Isograph compilation completed successfully in ${workingDir}`,
        );
      } else {
        logger.error(
          `❌ Isograph compilation failed in ${workingDir} with code ${result}`,
        );
        overallResult = result; // Track any failures
      }
    } catch (error) {
      logger.error(`Error running isograph compiler in ${workingDir}:`, error);
      overallResult = 1;
    }
  }

  if (overallResult === 0) {
    logger.info("✅ All Isograph compilations completed successfully");

    // Generate routes after successful compilation
    // Routes build removed - appBuild deleted
    logger.info("Skipping routes build (appBuild removed)");
  } else {
    logger.error("❌ One or more Isograph compilations failed");
  }

  return overallResult;
}

export const bftDefinition = {
  description: "Run the isograph compiler to generate code from GraphQL",
  fn: isoCommand,
} satisfies TaskDefinition;
