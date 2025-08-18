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
  readonly GOOGLE_OAUTH_CLIENT_SECRET?: string;
}

// Server-only variables (from .env.secrets.example)
interface ServerEnvVars {
  readonly GOOGLE_OAUTH_CLIENT_SECRET?: string;
  readonly CODEBOT_GITHUB_PAT?: string;
  readonly JWT_SECRET?: string;
  readonly OPENROUTER_API_KEY?: string;
  readonly TERRAFORM_BACKEND_ACCESS_KEY_ID?: string;
  readonly TERRAFORM_BACKEND_SECRET_ACCESS_KEY?: string;
  readonly HETZNER_API_TOKEN?: string;
  readonly HETZNER_PROJECT_ID?: string;
  readonly AWS_ACCESS_KEY_ID?: string;
  readonly AWS_SECRET_ACCESS_KEY?: string;
  readonly S3_ENDPOINT?: string;
  readonly CLOUDFLARE_API_TOKEN?: string;
  readonly CLOUDFLARE_ZONE_ID?: string;
  readonly CLOUDFLARE_ZONE_ID_PROMPTGRADE?: string;
  readonly HYPERDX_API_KEY?: string;
  readonly SSH_PUBLIC_KEY?: string;
  readonly SSH_PRIVATE_KEY?: string;
  readonly GITHUB_PERSONAL_ACCESS_TOKEN?: string;
  readonly TERRAFORM_BACKEND_ENDPOINT?: string;
  readonly CLOUDFLARE_ZONE_ID_BLTCDN?: string;
  readonly S3_ACCESS_KEY?: string;
  readonly S3_SECRET_KEY?: string;
  readonly ASSET_STORAGE_BUCKET?: string;
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
