#!/usr/bin/env -S deno run -A
/**
 * BFT (Bolt Foundry Task) - Command line executable
 *
 * This executable provides a cleanroom implementation for the new bft command.
 */

import { taskMap } from "../bft.ts";
import { join } from "@std/path";
import { createPrefixedUI } from "@bfmono/packages/tui/tui.ts";

const ui = createPrefixedUI("bft");

// Load all .bft.ts and .bft.deck.md files from the tasks directory
async function loadBftTasks(): Promise<void> {
  const bftTasksDir = join(
    import.meta.dirname!,
    "..",
    "tasks",
  );

  try {
    for await (const entry of Deno.readDir(bftTasksDir)) {
      if (entry.isFile) {
        // Handle .bft.ts files
        if (entry.name.endsWith(".bft.ts")) {
          const taskName = entry.name.slice(0, -7); // Remove .bft.ts extension

          try {
            // Import the task module
            const modulePath = join(bftTasksDir, entry.name);
            const module = await import(modulePath);

            // Look for the bftDefinition export
            const taskDef = module.bftDefinition;

            if (
              taskDef && typeof taskDef.fn === "function" && taskDef.description
            ) {
              taskMap.set(taskName, taskDef);
            } else {
              ui.error(
                `Task ${entry.name} does not export a valid bftDefinition`,
              );
            }
          } catch (error) {
            ui.error(`Failed to load task ${entry.name}: ${error}`);
          }
        } // Handle .bft.deck.md files
        else if (entry.name.endsWith(".bft.deck.md")) {
          const taskName = entry.name.slice(0, -12); // Remove .bft.deck.md extension
          const deckPath = join(bftTasksDir, entry.name);

          // Create a task that runs the deck
          taskMap.set(taskName, {
            description: `Run ${taskName} deck`,
            fn: createDeckRunner(deckPath),
          });
        }
      }
    }
  } catch (error) {
    ui.error(`Failed to read bft tasks directory: ${error}`);
  }
}

// Create a function that runs a specific deck
function createDeckRunner(
  deckPath: string,
): (args: Array<string>) => Promise<number> {
  return async (args: Array<string>) => {
    // Import deck module to get access to its functions
    const deckModule = await import("../tasks/deck.bft.ts");

    // Prepare arguments for deck run command
    const deckArgs = ["run", deckPath, ...args];

    // Call the deck function
    return await deckModule.bftDefinition.fn(deckArgs);
  };
}

async function main(): Promise<number> {
  // Change to the @bfmono directory before doing anything
  const bfmonoDir = new URL(import.meta.resolve("@bfmono/")).pathname;
  try {
    Deno.chdir(bfmonoDir);
  } catch (error) {
    ui.error(`Failed to change to @bfmono directory: ${error}`);
    return 1;
  }

  // Load all available tasks
  await loadBftTasks();

  const args = Deno.args;

  // Show help if no arguments or --help
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    ui.output("Usage: bft <command> [arguments...]\n");
    const helpTask = taskMap.get("help");
    if (helpTask) {
      return await helpTask.fn([]);
    }
    return 0;
  }

  const commandName = args[0];
  const commandArgs = args.slice(1);

  // Look up the command
  const task = taskMap.get(commandName);

  if (!task) {
    ui.error(`Unknown command: ${commandName}`);
    ui.error(`Run 'bft help' for available commands`);
    return 1;
  }

  // AI safety is now handled by hooks, not by BFT framework

  // Execute the command
  try {
    const exitCode = await task.fn(commandArgs);
    return exitCode;
  } catch (error) {
    ui.error(`Error executing command '${commandName}': ${error}`);
    return 1;
  }
}

// Run main and exit with the returned code
const exitCode = await main();
Deno.exit(exitCode);
