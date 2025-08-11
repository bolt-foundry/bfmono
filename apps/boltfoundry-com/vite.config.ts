import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import { boltFoundryEnvPlugin } from "@bfmono/packages/env/vite-plugin.ts";

const allowedHosts = true;

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    deno(),
    react({ babel: { babelrc: true } }),
    boltFoundryEnvPlugin(),
  ],
  define: {
    "globalThis.__ENVIRONMENT__": JSON.stringify({
      GOOGLE_OAUTH_CLIENT_ID: getConfigurationVariable(
        "GOOGLE_OAUTH_CLIENT_ID",
      ),
    }),
  },
  server: {
    port: 8080,
    hmr: {
      port: 8081,
    },
    allowedHosts,
    fs: {
      // Allow serving files from the entire monorepo
      allow: ["../.."],
    },
    watch: {
      // Ignore temporary files that cause crashes
      ignored: [
        "**/vite.config.ts.timestamp-*",
        "**/static/build/**", // Ignore build directory changes during e2e tests
        "**/.vite/**",
        "**/tmp/**",
        "**/node_modules/**",
      ],
    },
  },
  preview: {
    port: 8081,
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: new URL(import.meta.resolve("./ClientRoot.tsx")).pathname,
      output: {
        dir: new URL(import.meta.resolve("./static/build")).pathname,
        entryFileNames: "ClientRoot-[hash].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        format: "es",
      },
    },
  },
  resolve: {
    alias: {
      "@bfmono/": new URL(import.meta.resolve("@bfmono/")).pathname,
      "@bfmono/static/":
        new URL(import.meta.resolve("@bfmono/static/")).pathname,
    },
  },
  publicDir: new URL(import.meta.resolve("@bfmono/static/")).pathname,
});
