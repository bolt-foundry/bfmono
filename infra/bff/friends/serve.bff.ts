#! /usr/bin/env -S bff

import { register } from "@bfmono/infra/bff/bff.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export async function serveCommand(args: Array<string>): Promise<number> {
  // Parse port from args (looking for --port or -p)
  let port = "9999";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" || args[i] === "-p") {
      if (i + 1 < args.length) {
        port = args[i + 1];
      }
    }
  }

  const buildPath = "./build/web";

  // Check if build exists
  try {
    await Deno.stat(buildPath);
  } catch {
    logger.error("Build not found. Build process deprecated.");
    return 1;
  }

  logger.info(`Starting web server on port ${port}...`);

  // Run the web server
  const cmd = new Deno.Command(buildPath, {
    env: {
      ...Deno.env.toObject(),
      WEB_PORT: port,
    },
  });

  const child = cmd.spawn();
  const status = await child.status;

  return status.code || 0;
}

register(
  "serve",
  "Run the built web server (default port: 9999, use --port to override)",
  serveCommand,
  [],
);
