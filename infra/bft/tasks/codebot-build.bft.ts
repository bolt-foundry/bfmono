#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { dirname, join } from "@std/path";

export const bftDefinition: TaskDefinition = {
  description: "Build or rebuild the codebot container image",
  fn: async () => {
    ui.output("🔨 Building codebot container image...");

    // Path to Dockerfile
    const dockerfilePath = join(
      dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
      "apps",
      "codebot",
      "Dockerfile",
    );

    // Build context should be the internalbf directory (parent of bfmono)
    const currentPath = Deno.cwd();
    let buildContext: string;

    if (currentPath.includes("/bfmono")) {
      buildContext = currentPath.substring(
        0,
        currentPath.lastIndexOf("/bfmono"),
      );
    } else {
      buildContext = currentPath;
    }

    ui.output(`📁 Build context: ${buildContext}`);
    ui.output(`📄 Dockerfile: ${dockerfilePath}`);
    ui.output("⏳ This may take several minutes...");

    // Build the container
    const buildCmd = new Deno.Command("container", {
      args: [
        "build",
        "-t",
        "codebot",
        "-f",
        dockerfilePath,
        buildContext,
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const buildResult = await buildCmd.output();

    if (buildResult.success) {
      ui.output("✅ Container image built successfully");
      ui.output("🚀 You can now run: bft codebot");
      return 0;
    } else {
      ui.error("❌ Failed to build container image");
      return 1;
    }
  },
};
