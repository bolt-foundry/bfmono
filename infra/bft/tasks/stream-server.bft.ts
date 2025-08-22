import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";

export const streamServerTask: TaskDefinition = {
  name: "stream-server",
  description: "Start persistent E2E test streaming server",
  run: async (args: Array<string>) => {
    const port = args[0] || "8080";

    console.log(`🎥 Starting E2E Stream Server on port ${port}...`);

    // Set port environment variable
    Deno.env.set("BF_STREAM_PORT", port);

    // Run the persistent server
    const cmd = new Deno.Command("deno", {
      args: [
        "run",
        "--allow-net",
        "--allow-read",
        "--allow-env",
        "./infra/testing/video-streaming/persistent-stream-server.ts",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const child = cmd.spawn();
    const status = await child.status;

    if (!status.success) {
      throw new Error(`Stream server failed with exit code ${status.code}`);
    }
  },
};
