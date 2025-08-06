import { runShellCommand } from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";

const logger = getLogger(import.meta);

export async function submitCommand(options: Array<string>): Promise<number> {
  // Parse options
  const draftMode = options.includes("--draft") || options.includes("-d");
  const stackMode = options.includes("--stack") || options.includes("-s");
  const helpMode = options.includes("--help") || options.includes("-h");

  // Find message option (PR description)
  let message = "";
  const messageIndex = options.findIndex((opt) =>
    opt === "--message" || opt === "-m"
  );
  if (messageIndex !== -1 && messageIndex < options.length - 1) {
    message = options[messageIndex + 1];
  }

  if (helpMode) {
    logger.info(`
Usage: bft submit [options]

Submit a pull request using Sapling

Options:
  -m, --message  Pull request description/message
  -d, --draft    Create as draft PR
  -s, --stack    Also include draft ancestors
  --help         Show help

Examples:
  bft submit                           # Create PR interactively
  bft submit -m "Add new feature"     # Create PR with message
  bft submit --draft                  # Create draft PR
  bft submit -s                       # Submit entire stack

Note: The PR title will be taken from your commit message.
      Use 'sl amend -m "New title"' to update it before submitting.
`);
    return 0;
  }

  try {
    // Build the PR submit command for Sapling
    const prArgs = ["sl", "pr", "submit"];

    if (draftMode) {
      prArgs.push("--draft");
    }

    if (stackMode) {
      prArgs.push("--stack");
    }

    if (message) {
      prArgs.push("--message", message);
    }

    logger.info(`📤 Submitting pull request...`);

    // Execute the PR submit
    const result = await runShellCommand(prArgs);

    if (result === 0) {
      logger.info(`✅ Successfully submitted pull request`);
    } else {
      logger.error(`❌ Failed to submit pull request`);
    }

    return result;
  } catch (error) {
    logger.error(
      "❌ Failed to submit pull request:",
      error instanceof Error ? error.message : String(error),
    );
    return 1;
  }
}

export const bftDefinition = {
  description: "Submit pull request using Sapling",
  fn: submitCommand,
} satisfies TaskDefinition;
