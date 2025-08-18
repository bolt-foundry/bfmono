#! /usr/bin/env -S bff

import { register } from "@bfmono/infra/bff/bff.ts";
import {
  runShellCommand,
  runShellCommandWithOutput,
} from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export async function fork(): Promise<number> {
  logger.info("Forking Bolt Foundry repository...");

  // 1. Check GitHub auth status first
  const { stdout: authStatus } = await runShellCommandWithOutput([
    "gh",
    "auth",
    "status",
  ]);
  logger.log("GitHub auth status:", authStatus);

  // If not authenticated, do an interactive login
  if (
    !authStatus ||
    authStatus.includes("You are not logged into any GitHub hosts")
  ) {
    logger.info(
      "No valid GitHub authentication found. Attempting interactive login...",
    );

    // This uses Deno.Command to feed a "y\n" into the prompt:
    const ghCommand = new Deno.Command("gh", {
      args: [
        "auth",
        "login",
        "--hostname",
        "github.com",
        "--web",
        "--git-protocol",
        "https",
      ],
      stdin: "piped",
    });
    const ghProcess = ghCommand.spawn();
    const writer = ghProcess.stdin.getWriter();
    await writer.write(new TextEncoder().encode("y\n"));
    await writer.close();
    await ghProcess.status;
  }

  // 2. Retrieve your GitHub username (also confirms login success)
  const { stdout: userInfo } = await runShellCommandWithOutput([
    "gh",
    "api",
    "user",
  ]);
  const username = JSON.parse(userInfo).login;
  const forkRepoUrl = `https://github.com/${username}/bolt-foundry.git`;

  // 3. Check if the fork already exists
  //    "gh api repos/<username>/bolt-foundry" returns exit code 0 if it exists
  let repoAlreadyForked = false;
  const checkForkExitCode = await runShellCommand([
    "gh",
    "api",
    `repos/${username}/bolt-foundry`,
  ]);

  if (checkForkExitCode === 0) {
    // 0 => success => the repo (fork) is found
    repoAlreadyForked = true;
    logger.info(
      `It looks like you already have a fork at ${forkRepoUrl}. Skipping fork creation.`,
    );
  } else {
    logger.info("No existing fork detected. Creating a new fork...");
  }

  // 4. Fork if not already forked
  if (!repoAlreadyForked) {
    const forkResult = await runShellCommand([
      "gh",
      "repo",
      "fork",
      "bolt-foundry/bfmono",
      "--clone=false",
    ]);
    if (forkResult !== 0) {
      logger.error("Failed to fork repository.");
      return forkResult; // exit early
    }
    logger.info(`Successfully forked the repository to ${forkRepoUrl}`);
  }

  // 5. Configure local Git
  //    Remove any existing "origin" and add a new one pointing to your fork
  logger.info("Removing existing Git origin (if any)...");
  await runShellCommand(["git", "remote", "remove", "origin"]);
  // ^ We ignore errors here in case 'origin' does not exist.

  logger.info(`Adding new Git origin => ${forkRepoUrl}`);
  const addOriginExitCode = await runShellCommand([
    "git",
    "remote",
    "add",
    "origin",
    forkRepoUrl,
  ]);
  if (addOriginExitCode !== 0) {
    logger.error("Failed to set Git origin");
    return addOriginExitCode;
  }
  logger.info("Successfully set Git origin");

  // 6. Configure Sapling similarly: remove old origin + add new
  logger.info("Removing existing Sapling origin (if any)...");
  // According to Sapling docs: `sl path --delete origin`
  await runShellCommand(["sl", "path", "--delete", "default"]);

  logger.info(`Adding new Sapling origin => ${forkRepoUrl}`);
  // `sl path --add origin URL`
  const saplingResult = await runShellCommand([
    "sl",
    "path",
    "--add",
    "default",
    forkRepoUrl,
  ]);
  if (saplingResult !== 0) {
    logger.error("Failed to set Sapling origin");
    return saplingResult;
  }

  // 7. Done
  logger.info("Upstream configuration complete!");
  return 0; // Success
}

register(
  "fork",
  "Fork the Bolt Foundry repository to your personal GitHub account",
  fork,
);
