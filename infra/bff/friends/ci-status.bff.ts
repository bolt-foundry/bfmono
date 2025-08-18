#! /usr/bin/env -S bff

import { register } from "@bfmono/infra/bff/bff.ts";
import { runShellCommandWithOutput } from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Types for GitHub API responses
interface CheckRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  details_url: string;
  output?: {
    annotations_url?: string;
    text?: string;
    summary?: string;
  };
}

interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
}

interface Annotation {
  path?: string;
  start_line?: number;
  annotation_level: string;
  message: string;
  raw_details?: string;
}

export async function ciStatus(args: Array<string>): Promise<number> {
  // Parse arguments for commit hash and flags
  const showDetails = args.includes("--details") || args.includes("-d");
  const filteredArgs = args.filter((arg) =>
    !arg.startsWith("--") && !arg.startsWith("-")
  );
  const [commitHash] = filteredArgs;

  let targetCommit = commitHash;

  // If no commit provided, get the current commit
  if (!targetCommit) {
    const { stdout: currentCommit } = await runShellCommandWithOutput([
      "sl",
      "log",
      "-r",
      ".",
      "-T",
      "{node|short}",
    ]);
    targetCommit = currentCommit.trim();
  }

  logger.info(`Fetching check status for commit: ${targetCommit}`);

  // Use hardcoded repo for now since we're in bolt-foundry/bfmono
  const owner = "bolt-foundry";
  const repoName = "bfmono";

  try {
    // Fetch both check runs and workflow runs for the commit
    const checkRunsResult = await runShellCommandWithOutput([
      "gh",
      "api",
      `repos/${owner}/${repoName}/commits/${targetCommit}/check-runs`,
      "--jq",
      ".check_runs",
    ]);

    // Also fetch workflow runs
    const workflowRunsResult = await runShellCommandWithOutput([
      "gh",
      "api",
      `repos/${owner}/${repoName}/actions/runs?head_sha=${targetCommit}`,
      "--jq",
      ".workflow_runs",
    ]);

    const checkRuns: Array<CheckRun> = JSON.parse(checkRunsResult.stdout);
    const workflowRuns: Array<WorkflowRun> = JSON.parse(
      workflowRunsResult.stdout,
    );

    if (checkRuns.length === 0 && workflowRuns.length === 0) {
      logger.info("No check runs or workflow runs found for this commit");

      // Try fetching with the full commit hash
      const { stdout: fullCommit } = await runShellCommandWithOutput([
        "sl",
        "log",
        "-r",
        targetCommit,
        "-T",
        "{node}",
      ]);

      if (fullCommit.trim() !== targetCommit) {
        logger.info(`Trying with full commit hash: ${fullCommit.trim()}`);
        return ciStatus([fullCommit.trim()]);
      }

      return 0;
    }

    // Group check runs by status
    const statusGroups: Record<string, Array<CheckRun>> = {
      completed: [],
      in_progress: [],
      queued: [],
    };

    checkRuns.forEach((check: CheckRun) => {
      const status = check.status;
      if (statusGroups[status]) {
        statusGroups[status].push(check);
      }
    });

    // Display workflow runs first
    if (workflowRuns.length > 0) {
      logger.info("\nGitHub Actions Workflows:");
      logger.info("=".repeat(40));

      workflowRuns.forEach((workflow: WorkflowRun) => {
        const statusEmoji = workflow.status === "completed"
          ? (workflow.conclusion === "success"
            ? "✅"
            : workflow.conclusion === "failure"
            ? "❌"
            : workflow.conclusion === "cancelled"
            ? "🚫"
            : "❓")
          : workflow.status === "in_progress"
          ? "🔄"
          : "⏳";

        logger.info(`${statusEmoji} ${workflow.name} (${workflow.status})`);
        if (workflow.conclusion) {
          logger.info(`   Conclusion: ${workflow.conclusion}`);
        }
      });
    }

    // Display check statuses
    logger.info("\nCheck Status Summary:");
    logger.info("=".repeat(40));

    // Show completed checks
    if (statusGroups.completed.length > 0) {
      logger.info("\n✅ Completed:");
      for (const check of statusGroups.completed) {
        const emoji = check.conclusion === "success"
          ? "✅"
          : check.conclusion === "failure"
          ? "❌"
          : check.conclusion === "neutral"
          ? "⚪"
          : check.conclusion === "cancelled"
          ? "🚫"
          : check.conclusion === "skipped"
          ? "⏭️"
          : "❓";
        logger.info(`  ${emoji} ${check.name}: ${check.conclusion}`);

        // Show detailed failure information when requested
        if (showDetails && check.conclusion === "failure") {
          logger.info(`     Details: ${check.details_url}`);

          try {
            // Only fetch annotations if the URL exists
            if (check.output?.annotations_url) {
              const annotationsResult = await runShellCommandWithOutput([
                "gh",
                "api",
                check.output.annotations_url,
                "--jq",
                ".[]",
              ]);

              if (annotationsResult.stdout.trim()) {
                // Parse each line as a separate JSON object
                const lines = annotationsResult.stdout.trim().split("\n");
                const annotations: Array<Annotation> = lines.map((line) =>
                  JSON.parse(line)
                );

                for (const annotation of annotations) {
                  logger.info("\n     Error Details:");
                  if (annotation.path) {
                    logger.info(
                      `     File: ${annotation.path}:${
                        annotation.start_line || 0
                      }`,
                    );
                  }
                  logger.info(`     Level: ${annotation.annotation_level}`);
                  logger.info(`     Message: ${annotation.message}`);
                  if (annotation.raw_details) {
                    logger.info(`     Raw Details: ${annotation.raw_details}`);
                  }
                }
              }
            }

            // Also try to get logs from the check run
            if (check.id) {
              try {
                const logsResult = await runShellCommandWithOutput([
                  "gh",
                  "api",
                  `repos/${owner}/${repoName}/actions/jobs/${check.id}/logs`,
                  "--header",
                  "Accept: application/vnd.github.v3+json",
                ]);

                if (logsResult.stdout) {
                  // Extract the last few error lines from the logs
                  const logLines = logsResult.stdout.split("\n");
                  const errorLines = logLines.filter((line) =>
                    line.toLowerCase().includes("error") ||
                    line.toLowerCase().includes("failed") ||
                    line.includes("FAIL ")
                  ).slice(-10); // Get last 10 error lines

                  if (errorLines.length > 0) {
                    logger.info("\n     Log Errors:");
                    errorLines.forEach((line) => {
                      logger.info(`     ${line.trim()}`);
                    });
                  }
                }
              } catch (_logError) {
                // Logs might not be available or accessible
              }
            }
          } catch (_error) {
            // If all else fails, show the output text/summary
            if (check.output?.text || check.output?.summary) {
              logger.info("\n     Failure Output:");
              logger.info(`     ${check.output.text || check.output.summary}`);
            }
          }
        }
      }
    }

    // Show in-progress checks
    if (statusGroups.in_progress.length > 0) {
      logger.info("\n🔄 In Progress:");
      statusGroups.in_progress.forEach((check: CheckRun) => {
        logger.info(`  🔄 ${check.name}`);
      });
    }

    // Show queued checks
    if (statusGroups.queued.length > 0) {
      logger.info("\n⏳ Queued:");
      statusGroups.queued.forEach((check: CheckRun) => {
        logger.info(`  ⏳ ${check.name}`);
      });
    }

    // Overall status summary
    const hasFailures = statusGroups.completed.some(
      (check: CheckRun) => check.conclusion === "failure",
    );
    const hasInProgress = statusGroups.in_progress.length > 0 ||
      statusGroups.queued.length > 0;

    logger.info("\n" + "=".repeat(40));
    if (hasFailures) {
      logger.error("❌ Some checks have failed");
      return 1;
    } else if (hasInProgress) {
      logger.info("🔄 Checks are still running");
      return 0;
    } else {
      logger.info("✅ All checks passed");
      return 0;
    }
  } catch (error) {
    logger.error("Failed to fetch check status:", error);
    return 1;
  }
}

register(
  "ci-status",
  "Check GitHub CI status for current or specified commit. Use --details or -d to show failure details",
  ciStatus,
  [],
);

export default ciStatus;
