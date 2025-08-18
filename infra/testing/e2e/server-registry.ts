/**
 * E2E Server Registry
 *
 * This registry maps test file patterns to the servers they need.
 * Each server entry defines how to start and configure the server.
 */

import { globToRegExp } from "@std/path/glob-to-regexp";
import { relative } from "@std/path";

export interface ServerConfig {
  /** Unique identifier for this server */
  name: string;
  /** Path to the server entry point */
  serverPath: string;
  /** Default port to try (will find available port if occupied) */
  defaultPort: number;
  /** Environment variable name to set with the server URL */
  envVar: string;
  /** Optional environment variables to set when starting the server */
  env?: Record<string, string>;
}

export interface ServerRegistryEntry {
  /** Glob pattern(s) that match test files requiring this server */
  testPatterns: Array<string>;
  /** Server configuration */
  server: ServerConfig;
}

/**
 * Registry of servers and the test patterns that require them
 */
export const E2E_SERVER_REGISTRY: Array<ServerRegistryEntry> = [
  {
    testPatterns: [
      "apps/aibff/gui/**/*.e2e.ts",
      "**/aibff-gui*.e2e.ts",
    ],
    server: {
      name: "aibff-gui",
      serverPath: "./apps/aibff/gui/main.ts",
      defaultPort: 8001,
      envVar: "BF_E2E_AIBFF_GUI_URL",
      env: {
        "BF_MODE": "production",
      },
    },
  },
  {
    testPatterns: [
      "apps/boltfoundry-com/**/*.e2e.ts",
      "**/boltfoundry-com*.e2e.ts",
    ],
    server: {
      name: "boltfoundry-com",
      serverPath: "./build/boltfoundry-com",
      defaultPort: 8002,
      envVar: "BF_E2E_BOLTFOUNDRY_COM_URL",
      env: {
        "BF_E2E_MODE": "true",
      },
    },
  },
];

/**
 * Determines which servers are needed based on test file paths
 */
export function getRequiredServers(
  testFiles: Array<string>,
): Array<ServerConfig> {
  const requiredServers = new Set<ServerConfig>();

  // Get project root from import.meta.resolve
  const projectRoot = new URL("../../../", import.meta.url).pathname;

  for (const testFile of testFiles) {
    // Normalize path to be relative to project root
    const normalizedPath = relative(projectRoot, testFile);

    for (const entry of E2E_SERVER_REGISTRY) {
      const isMatch = entry.testPatterns.some((pattern) => {
        const regex = globToRegExp(pattern);
        const matches = regex.test(normalizedPath);
        return matches;
      });

      if (isMatch) {
        requiredServers.add(entry.server);
      }
    }
  }
  return Array.from(requiredServers);
}

/**
 * Gets server config by name
 */
export function getServerConfig(name: string): ServerConfig | undefined {
  for (const entry of E2E_SERVER_REGISTRY) {
    if (entry.server.name === name) {
      return entry.server;
    }
  }
  return undefined;
}
