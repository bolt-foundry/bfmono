// Auto-generated from .env.example files - do not edit manually
// Run 'bft sitevar generate-types' to regenerate

/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

// Base types for all environments
interface BaseImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
}

// Client-safe variables (from .env.config.example)
interface ClientEnvVars {
  readonly GOOGLE_OAUTH_CLIENT_ID?: string;
}

// Server-only variables (from .env.secrets.example)
interface ServerEnvVars {
  readonly GOOGLE_OAUTH_CLIENT_SECRET?: string;
  readonly CODEBOT_GITHUB_PAT?: string;
  readonly JWT_SECRET?: string;
}

// Environment-aware typing
declare namespace ImportMetaEnv {
  // Client environment: Only client-safe + base variables
  interface Client extends BaseImportMetaEnv, ClientEnvVars {
    readonly SSR: false;
  }

  // Server environment: All variables available
  interface Server extends BaseImportMetaEnv, ClientEnvVars, ServerEnvVars {
    readonly SSR: boolean;
  }
}

// Runtime environment detection using window availability
declare interface ImportMeta {
  readonly env: typeof globalThis extends { window: unknown }
    ? ImportMetaEnv.Client // Client context (browser)
    : ImportMetaEnv.Server; // Server context (Deno)
}

// For compatibility with existing env.d.ts expectations
interface ImportMetaEnv extends ImportMetaEnv.Server {}
