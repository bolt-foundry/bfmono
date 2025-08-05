#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { dirname, join, basename } from "@std/path";
import { exists } from "@std/fs";

interface PeopleConfig {
  name: string;
  googleDrivePath?: string;
}

async function detectGoogleDrivePath(): Promise<string | null> {
  const homeDir = getConfigurationVariable("HOME");
  const user = getConfigurationVariable("USER");
  
  // Check if we're in a container
  const isContainer = getConfigurationVariable("CODEBOT_CONTAINER") === "true";
  
  if (isContainer) {
    // In container, Google Drive is mounted at a fixed location
    const containerPath = "/home/codebot/google-drive";
    if (await exists(containerPath)) {
      return containerPath;
    }
    return null;
  }
  
  // On host, check standard Google Drive locations
  const possiblePaths = [
    `${homeDir}/Google Drive`,
    `${homeDir}/Library/CloudStorage/GoogleDrive-${user}@gmail.com`,
    `${homeDir}/Library/CloudStorage/GoogleDrive`,
  ];
  
  for (const path of possiblePaths) {
    if (await exists(path)) {
      return path;
    }
  }
  
  return null;
}

async function getPeopleDirectory(): Promise<string> {
  const isContainer = getConfigurationVariable("CODEBOT_CONTAINER") === "true";
  if (isContainer) {
    return "/internalbf/people";
  }
  
  // On host, find the internalbf root directory
  let currentDir = Deno.cwd();
  
  // If we're in a subdirectory (like bfmono), go up to find internalbf root
  while (currentDir !== "/" && !currentDir.endsWith("/internalbf")) {
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root
    
    // Check if parent is internalbf
    if (parentDir.endsWith("/internalbf")) {
      currentDir = parentDir;
      break;
    }
    
    // Check if current dir contains people directory at internalbf level
    const internalbfPath = join(parentDir, "internalbf");
    if (await exists(internalbfPath)) {
      currentDir = internalbfPath;
      break;
    }
    
    currentDir = parentDir;
  }
  
  // If we found internalbf, use it; otherwise fall back to current directory
  if (currentDir.endsWith("/internalbf")) {
    return join(currentDir, "people");
  }
  
  // Last resort: check if there's an internalbf directory in current path
  const parts = Deno.cwd().split("/");
  const internalbfIndex = parts.lastIndexOf("internalbf");
  if (internalbfIndex !== -1) {
    const internalbfPath = parts.slice(0, internalbfIndex + 1).join("/");
    return join(internalbfPath, "people");
  }
  
  // Fallback to current directory
  return join(Deno.cwd(), "people");
}

async function createSymlink(args: string[]): Promise<number> {
  // Parse arguments
  let userName = getConfigurationVariable("USER") || "user";
  let folderName = "";
  
  if (args.length === 1) {
    folderName = args[0];
  } else if (args.length === 2) {
    userName = args[0];
    folderName = args[1];
  } else if (args.length > 2) {
    ui.error("❌ Too many arguments. Usage: bft people add [username] <folder-name>");
    return 1;
  }
  
  // Detect Google Drive path
  const googleDrivePath = await detectGoogleDrivePath();
  if (!googleDrivePath) {
    ui.error("❌ Could not find Google Drive. Please ensure Google Drive is installed and synced.");
    return 1;
  }
  
  ui.output(`📁 Found Google Drive at: ${googleDrivePath}`);
  
  // Construct paths
  const peopleDir = await getPeopleDirectory();
  const symlinkPath = join(peopleDir, userName);
  
  // Check if symlink already exists
  if (await exists(symlinkPath)) {
    ui.warn(`⚠️ Path already exists: ${symlinkPath}`);
    const response = await ui.prompt("Do you want to replace it? (y/n)");
    if (response?.toLowerCase() !== "y") {
      ui.output("❌ Cancelled");
      return 1;
    }
    await Deno.remove(symlinkPath);
  }
  
  // Determine source path
  let sourcePath: string;
  if (folderName) {
    sourcePath = join(googleDrivePath, "My Drive", folderName);
  } else {
    // Interactive mode - prompt for folder
    ui.output("\n📂 Enter the path within Google Drive (relative to 'My Drive'):");
    ui.output("Examples: 'work', 'personal/okrs', 'bolt-foundry/goals'");
    const input = await ui.prompt("Folder path");
    if (!input) {
      ui.error("❌ No folder specified");
      return 1;
    }
    sourcePath = join(googleDrivePath, "My Drive", input);
  }
  
  // Create the source directory if it doesn't exist
  if (!await exists(sourcePath)) {
    ui.output(`📁 Creating directory: ${sourcePath}`);
    await Deno.mkdir(sourcePath, { recursive: true });
  }
  
  // Create symlink
  try {
    await Deno.symlink(sourcePath, symlinkPath);
    ui.output(`✅ Created symlink: ${userName} → ${sourcePath}`);
    
    // Show instructions based on environment
    const isContainer = getConfigurationVariable("CODEBOT_CONTAINER") === "true";
    if (isContainer) {
      ui.output("\n📝 Note: This symlink is container-specific.");
      ui.output("   On the host, create a corresponding symlink with: bft people add");
    } else {
      ui.output("\n📝 Note: This symlink is host-specific.");
      ui.output("   In containers, the Google Drive will be auto-mounted.");
    }
    
    return 0;
  } catch (error) {
    ui.error(`❌ Failed to create symlink: ${error}`);
    return 1;
  }
}

async function listSymlinks(): Promise<number> {
  const peopleDir = await getPeopleDirectory();
  
  ui.output("📁 People directory symlinks:\n");
  
  try {
    let found = false;
    for await (const entry of Deno.readDir(peopleDir)) {
      if (entry.name === "README.md") continue;
      
      const fullPath = join(peopleDir, entry.name);
      try {
        const linkTarget = await Deno.readLink(fullPath);
        ui.output(`  ${entry.name} → ${linkTarget}`);
        found = true;
      } catch {
        // Not a symlink, could be a regular directory
        if (entry.isDirectory) {
          ui.output(`  ${entry.name} (directory, not a symlink)`);
          found = true;
        }
      }
    }
    
    if (!found) {
      ui.output("  (no symlinks found)");
    }
    
    return 0;
  } catch (error) {
    ui.error(`❌ Failed to list symlinks: ${error}`);
    return 1;
  }
}

async function removeSymlink(args: string[]): Promise<number> {
  if (args.length !== 1) {
    ui.error("❌ Usage: bft people remove <username>");
    return 1;
  }
  
  const userName = args[0];
  const peopleDir = await getPeopleDirectory();
  const symlinkPath = join(peopleDir, userName);
  
  if (!await exists(symlinkPath)) {
    ui.error(`❌ Symlink not found: ${userName}`);
    return 1;
  }
  
  try {
    const linkTarget = await Deno.readLink(symlinkPath);
    const response = await ui.prompt(`Remove symlink ${userName} → ${linkTarget}? (y/n)`);
    if (response?.toLowerCase() !== "y") {
      ui.output("❌ Cancelled");
      return 1;
    }
    
    await Deno.remove(symlinkPath);
    ui.output(`✅ Removed symlink: ${userName}`);
    return 0;
  } catch (error) {
    ui.error(`❌ Failed to remove symlink: ${error}`);
    return 1;
  }
}

function showHelp(): void {
  ui.output(`
PEOPLE - Manage personal workspace symlinks in the people directory

USAGE:
  bft people <command> [options]

COMMANDS:
  add [username] <folder>  Create symlink to Google Drive folder
  list                     List all symlinks in people directory
  remove <username>        Remove a symlink
  help                     Show this help message

EXAMPLES:
  bft people add work                  # Create symlink for current user to 'work' folder
  bft people add randallb projects      # Create symlink for 'randallb' to 'projects' folder
  bft people add                       # Interactive mode - prompts for folder
  bft people list                      # Show all symlinks
  bft people remove randallb           # Remove randallb's symlink

NOTES:
  - Google Drive must be installed and synced
  - Symlinks are automatically ignored by git
  - In containers, Google Drive is auto-mounted at /home/codebot/google-drive
  - On host, Google Drive is detected from standard locations
`);
}

export const bftDefinition: TaskDefinition = {
  description: "Manage personal workspace symlinks in people directory",
  fn: async (args: Array<string>) => {
    const command = args[0];
    
    if (!command || command === "help") {
      showHelp();
      return 0;
    }
    
    switch (command) {
      case "add":
        return await createSymlink(args.slice(1));
      case "list":
        return await listSymlinks();
      case "remove":
        return await removeSymlink(args.slice(1));
      default:
        ui.error(`❌ Unknown command: ${command}`);
        showHelp();
        return 1;
    }
  },
};