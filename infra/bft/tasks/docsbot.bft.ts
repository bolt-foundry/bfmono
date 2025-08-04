#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { type BotConfig, runBot } from "../lib/container-bot-base.ts";

const docsbotConfig: BotConfig = {
  name: "docsbot",
  envVar: "DOCSBOT_CONTAINER",
  // No special GitHub token for docsbot
  helpExamples: `
DOCSBOT - Documentation bot in isolated container

USAGE:
  bft docsbot [OPTIONS]

OPTIONS:
  --workspace <name>      Use specific workspace name (e.g., fuzzy-goat)
  --resume                Resume from existing workspace (interactive selection)
  --cleanup               Delete workspace after exit
  --cleanup-containers    Clean up all stopped containers
  --shell                 Open shell instead of default command
  --exec <command>        Execute command and exit
  --checkout <branch>     Checkout branch with auto shelve/unshelve
  --memory <size>         Container memory limit (e.g., 4g, 8192m)
  --cpus <count>          Number of CPUs (e.g., 4)
  --force-rebuild         Force rebuild container image
  --debug-logs            Enable debug logging for troubleshooting
  --help                  Show this help

EXAMPLES:
  bft docsbot                           # Start docsbot (new workspace)
  bft docsbot --workspace fuzzy-goat    # Resume running container or reuse workspace
  bft docsbot --resume                  # Choose from existing workspaces
  bft docsbot --cleanup                 # Start and cleanup workspace when done
  bft docsbot --shell                   # Open container shell for debugging
  bft docsbot --exec "ls -la"           # Run command and exit
  bft docsbot --checkout remote/main    # Checkout branch with auto shelve/unshelve
  bft docsbot --memory 8g --cpus 8      # Run with 8GB RAM and 8 CPUs

WORKSPACE INFO:
  - Workspaces are stored in codebot-workspaces/
  - Each workspace is a CoW (copy-on-write) clone for instant creation
  - Use --cleanup to remove workspace after use
  - Use --resume to continue with existing workspace

DEBUGGING:
  - Container name matches workspace name
  - Access via: http://<workspace-name>.codebot.local:8000
  - Shell access: bft docsbot --workspace <name> --shell
  - View logs: container logs <workspace-name>
`,
};

export const bftDefinition: TaskDefinition = {
  description: "Documentation bot in isolated container",
  fn: async () => {
    return await runBot(docsbotConfig);
  },
};
