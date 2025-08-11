#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --watch

import { parseArgs } from "@std/cli";
import { getLogger } from "@bolt-foundry/logger";
import { renderToReadableStream } from "react-dom/server";
import { ServerRenderedPage } from "./server/components/ServerRenderedPage.tsx";
import App from "./src/App.tsx";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";

const logger = getLogger(import.meta);
const requestLogger = getLogger("promptgrade-ai/requests");

// Types for Vite manifest
interface ViteManifestEntry {
  file: string;
  css?: Array<string>;
}

interface ViteManifest {
  [key: string]: ViteManifestEntry;
}

// Read Vite manifest to get asset paths
async function loadAssetPaths(
  isDev: boolean,
): Promise<{ cssPath?: string; jsPath: string }> {
  if (isDev) {
    // In dev mode, these paths aren't used since Vite handles everything
    const devPaths = {
      cssPath: undefined,
      jsPath: "/dev-not-used", // Vite handles all assets in dev mode
    };
    logger.info("Using dev asset paths (not used - Vite handles everything)");
    return devPaths;
  }

  try {
    const manifestUrl = import.meta.resolve(
      "./static/build/.vite/manifest.json",
    );
    const manifestPath = new URL(manifestUrl).pathname;
    const manifestData = await Deno.readFile(manifestPath);
    const manifestText = new TextDecoder().decode(manifestData);
    const manifest: ViteManifest = JSON.parse(manifestText);

    const entry = manifest["ClientRoot.tsx"];
    if (entry) {
      const assetPaths = {
        cssPath: entry.css?.[0] ? `/build/${entry.css[0]}` : undefined,
        jsPath: `/build/${entry.file}`,
      };
      logger.info("Production asset paths:", assetPaths);
      return assetPaths;
    } else {
      logger.error("Could not find ClientRoot.tsx in manifest");
      return { jsPath: "/build/ClientRoot.js" };
    }
  } catch (error) {
    logger.error("Failed to load manifest:", error);
    return { jsPath: "/build/ClientRoot.js" };
  }
}

async function handler(
  request: Request,
  isDev: boolean,
  assetPaths: { cssPath?: string; jsPath: string },
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  requestLogger.info(`${request.method} ${path}`);

  // Serve static assets
  if (path.startsWith("/build/")) {
    try {
      const assetPath = `./static${path}`;
      const file = await Deno.readFile(assetPath);
      const contentType = path.endsWith(".css")
        ? "text/css"
        : path.endsWith(".js")
        ? "application/javascript"
        : "application/octet-stream";
      
      return new Response(file, {
        headers: {
          "content-type": contentType,
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    } catch (_error) {
      return new Response("Not Found", { status: 404 });
    }
  }

  // Server-side render the app
  const environment = {
    currentPath: path,
    port: 9001,
    BF_ENV: getConfigurationVariable("BF_ENV") || "development",
  };

  const stream = await renderToReadableStream(
    <ServerRenderedPage environment={environment} assetPaths={assetPaths}>
      <App {...environment} />
    </ServerRenderedPage>,
  );

  return new Response(stream, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

if (import.meta.main) {
  const flags = parseArgs(Deno.args, {
    string: ["port"],
    default: {
      port: "9001",
    },
  });

  const port = parseInt(flags.port);
  const isDev = getConfigurationVariable("BF_ENV") === "development";
  
  // Load asset paths once at startup
  const assetPaths = await loadAssetPaths(isDev);

  logger.info(`Starting server on port ${port} (isDev: ${isDev})`);
  
  Deno.serve({ port }, (request) => handler(request, isDev, assetPaths));
}