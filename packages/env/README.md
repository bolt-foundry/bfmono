# Environment Variables

This package provides a universal environment variable system that works across
both server (Deno) and client (Vite) environments.

## Quick Start

```typescript
import { env } from "@bfmono/packages/env/mod.ts";

// Access environment variables with automatic type conversions
const apiKey = env.OPENAI_API_KEY;
const isProd = env.PROD; // boolean
const logLevel = env.LOG_LEVEL ?? "info";
```

## Setup

1. **Define your variables** in example files:
   - `.env.config.example` - Client-safe variables (exposed to browser)
   - `.env.secrets.example` - Server-only variables (never exposed to browser)

2. **Sync from 1Password**:
   ```bash
   bft sitevar sync
   ```
   This creates `.env.config` and `.env.secrets` with values from 1Password.

3. **TypeScript support** is auto-generated in `env.d.ts` with environment-aware
   types.

## Environment Files

- `.env.config` - Client-safe variables from 1Password
- `.env.secrets` - Server-only secrets from 1Password
- `.env.local` - Local development overrides (highest priority)

## Features

- **Automatic loading** from `.env.config`, `.env.secrets`, and `.env.local`
  files
- **Type conversions** - `"true"`/`"false"` strings become booleans
- **Priority order** - System env > `.env.local` > `.env.secrets` >
  `.env.config`
- **Special properties** - `MODE`, `PROD`, `DEV`, `SSR`, `BASE_URL`
- **Works everywhere** - No module isolation issues

## Migration from getConfigurationVariable

```typescript
// Old way (deprecated)
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
const apiKey = getConfigurationVariable("OPENAI_API_KEY");

// New way
import { env } from "@bfmono/packages/env/mod.ts";
const apiKey = env.OPENAI_API_KEY;
```

## Type Safety

The system provides environment-aware TypeScript types:

- **Client code** can only access client-safe variables
- **Server code** can access all variables
- Full auto-completion and type checking

## Commands

### Sync Commands

- `bft sitevar sync` - Sync all variables from 1Password
- `bft sitevar sync --config-only` - Sync only config variables
- `bft sitevar sync --secret-only` - Sync only secret variables

### Config Variables (Safe for Browser)

- `bft sitevar config set <key> <value>` - Set a config variable
- `bft sitevar config get <key>` - Get a config variable (validates it's a
  config var)
- `bft sitevar config remove <key>` - Remove a config variable

### Secret Variables (Backend Only)

- `bft sitevar secret set <key> <value>` - Set a secret variable
- `bft sitevar secret get <key>` - Get a secret variable (validates it's a
  secret)
- `bft sitevar secret remove <key>` - Remove a secret variable

**Note**: The `get` commands validate that you're retrieving the correct type of
variable. If you try to get a secret with `config get` or vice versa, you'll
receive a warning and the command will fail.

### Other Commands

- `bft sitevar list` - List all available variables
- `bft sitevar generate-types` - Regenerate TypeScript definitions
