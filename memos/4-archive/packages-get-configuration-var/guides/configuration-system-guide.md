# Guide: How the Configuration System Works

This guide explains how Bolt Foundry's configuration system works, using a
standards-based `import.meta.env` approach for managing environment variables
and secrets.

## Current Status

**Partially Implemented** - The server-side polyfill exists, but the complete
system needs additional components:

### ✅ What's Already Built

- `packages/env/polyfill.ts` - Deno polyfill that enables `import.meta.env`
- Support for loading from `.env.client`, `.env.server`, and `.env.local` files
- Basic environment variable parsing with proper precedence

### ❌ What Still Needs Implementation

- **Vite plugin** (`packages/env/vite-plugin.ts`) for client-side support
- **BFT command** (`bft sitevar sync`) for 1Password synchronization
- **Example files** (`.env.client.example` and `.env.server.example`)
- **Type generation** (`packages/env/generate-types.ts`)
- **Migration** from current configuration system to `import.meta.env`
- **Documentation** updates for the new workflow

## Quick Start

The configuration workflow works like this:

```bash
# Sync all secrets from 1Password
bft sitevar sync

# Use anywhere in your code
const apiKey = import.meta.env.OPENAI_API_KEY;
const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;
```

## System Architecture

### Core Components

- **Single sync command**: `bft sitevar sync` fetches all secrets
- **Standard API**: Uses web-standard `import.meta.env`
- **Security separation**: Clear client/server variable boundaries
- **Type generation**: Auto-generated TypeScript definitions
- **Environment files**: Separate `.env.client`, `.env.server`, and `.env.local`

## How It Works

### 1. Environment Variable Definition

The system uses example files to define all environment variables:

**`.env.client.example`** (Client-safe variables):

```bash
# Variables safe to expose in browser bundles
GOOGLE_OAUTH_CLIENT_ID=123456789.apps.googleusercontent.com
POSTHOG_API_KEY=phc_your_key_here
LOG_LEVEL=info
ENABLE_SPECIFIC_LOGGERS=false
LOG_LOGGERS_TO_ENABLE=auth,database
```

**`.env.server.example`** (Server-only variables):

```bash
# Variables that must never reach the browser
DATABASE_URL=postgresql://localhost:5432/boltfoundry
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
OPENAI_API_KEY=sk-your_openai_api_key_here
EMAIL_HOST=smtp.example.com
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

### 2. Server-Side Support (Deno Polyfill)

The `packages/env/polyfill.ts` enables `import.meta.env` in Deno:

```typescript
// packages/env/polyfill.ts
if (typeof Deno !== "undefined" && !import.meta.env) {
  const env = loadEnvironmentVariables();

  Object.defineProperty(import.meta, "env", {
    value: new Proxy({
      MODE: env.NODE_ENV || env.DENO_ENV || "development",
      BASE_URL: "/",
      PROD: (env.NODE_ENV || env.DENO_ENV) === "production",
      DEV: (env.NODE_ENV || env.DENO_ENV) !== "production",
      SSR: true,
    }, {
      get(target: any, key: string) {
        if (key in target) return target[key];
        const value = env[key];
        return value === "true" ? true : value === "false" ? false : value;
      },
    }),
    writable: false,
    configurable: false,
  });
}

function loadEnvironmentVariables(): Record<string, string> {
  const env: Record<string, string> = {};

  // Load files in priority order (lowest to highest)
  const envFiles = [".env.client", ".env.server", ".env.local"];

  for (const file of envFiles) {
    try {
      const content = Deno.readTextFileSync(file);
      Object.assign(env, parseEnvFile(content));
    } catch (error) {
      // File doesn't exist, continue
    }
  }

  // System environment variables have highest priority
  Object.assign(env, Deno.env.toObject());

  return env;
}
```

### 3. Client-Side Support (Vite Plugin)

The `packages/env/vite-plugin.ts` handles client-side integration:

```typescript
// packages/env/vite-plugin.ts
import type { Plugin } from "vite";

export function boltFoundryEnvPlugin(): Plugin {
  return {
    name: "bolt-foundry-env",
    config(config, { mode }) {
      // Load ONLY client-safe variables
      const clientEnv = loadClientEnvironment();

      config.define = {
        ...config.define,
        // Replace import.meta.env with actual values
        ...Object.fromEntries(
          Object.entries(clientEnv).map(([key, value]) => [
            `import.meta.env.${key}`,
            JSON.stringify(value),
          ]),
        ),
      };
    },
  };
}

function loadClientEnvironment(): Record<string, string> {
  const clientVars: Record<string, string> = {};

  // IMPORTANT: Only load client-safe files
  // Never load .env.server here!
  const envFiles = [".env.client", ".env.local"];

  for (const file of envFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      Object.assign(clientVars, parseEnvFile(content));
    } catch (error) {
      // File doesn't exist, continue
    }
  }

  return clientVars;
}
```

### 4. Secret Synchronization

The `bft sitevar sync` command in `infra/bft/tasks/sitevar.bft.ts`:

```typescript
#!/usr/bin/env -S bft run

// Core sync functionality
async function syncSecretsFromOnePassword(
  args: Array<string>,
): Promise<number> {
  const clientKeys = await getExampleKeys(".env.client.example");
  const serverKeys = await getExampleKeys(".env.server.example");

  // Get vault ID (auto-discover or prompt)
  const vaultId = await getVaultId();

  // Build 1Password template
  const template: Record<string, string> = {};
  [...clientKeys, ...serverKeys].forEach((key) => {
    template[key] = `op://${vaultId}/${key}/value`;
  });

  // Run op inject
  const result = await runOpInject(template);

  // Write to separate files
  await writeEnvFile(".env.client", clientKeys, result);
  await writeEnvFile(".env.server", serverKeys, result);

  // Auto-generate TypeScript types
  await generateTypeDefinitions();

  ui.info("✅ Site variables synced successfully");
  return 0;
}
```

### 5. TypeScript Type Generation

The `packages/env/generate-types.ts` creates environment-aware types:

```typescript
// packages/env/generate-types.ts
export function generateEnvTypes(): string {
  const clientVars = parseEnvFile(Deno.readTextFileSync(".env.client.example"));
  const serverVars = parseEnvFile(Deno.readTextFileSync(".env.server.example"));

  return `// Auto-generated - do not edit
interface ClientEnvVars {
${
    Object.keys(clientVars).map((key) => `  readonly ${key}?: string;`).join(
      "\n",
    )
  }
}

interface ServerEnvVars {
${
    Object.keys(serverVars).map((key) => `  readonly ${key}?: string;`).join(
      "\n",
    )
  }
}

declare interface ImportMeta {
  readonly env: typeof window extends undefined 
    ? BaseImportMetaEnv & ClientEnvVars & ServerEnvVars  // Server
    : BaseImportMetaEnv & ClientEnvVars;                 // Client
}`;
}
```

### 6. Using the Configuration System

#### For Deno/Server Code:

```typescript
// Add to your main entry point or deno.jsonc tasks
import "packages/env/polyfill.ts";

// Then use anywhere
const dbUrl = import.meta.env.DATABASE_URL;
const apiKey = import.meta.env.OPENAI_API_KEY;
```

#### For Vite/Client Code:

```typescript
// vite.config.ts
import { boltFoundryEnvPlugin } from "packages/env/vite-plugin.ts";

export default {
  plugins: [
    boltFoundryEnvPlugin(),
    // ... other plugins
  ],
};
```

## Migration Checklist

### Phase 1: Setup New System

- [ ] Create `.env.client.example` with all client-safe variables
- [ ] Create `.env.server.example` with all server-only variables
- [ ] Implement `packages/env/polyfill.ts`
- [ ] Implement `packages/env/vite-plugin.ts`
- [ ] Implement `bft sitevar sync` command
- [ ] Test with a sample application

### Phase 2: Migrate Applications

- [ ] Update all `getConfigurationVariable()` calls to `import.meta.env`
- [ ] Add polyfill import to Deno entry points
- [ ] Update Vite configs to use new plugin
- [ ] Remove old configuration imports

### Phase 3: Cleanup

- [ ] Remove old BFF commands
- [ ] Delete generated `configKeys.ts` files
- [ ] Remove shell integration scripts
- [ ] Update documentation

## Common Patterns

### Development Workflow

```bash
# Initial setup
bft sitevar sync

# Create local overrides
echo "LOG_LEVEL=debug" > .env.local

# Your app now uses debug logging locally
```

### Adding New Variables

1. Add to appropriate `.env.*.example` file
2. Run `bft sitevar sync` to regenerate types
3. TypeScript now knows about the new variable

### Production Deployment

```dockerfile
# Container startup script
RUN bft sitevar sync --production
CMD ["deno", "run", "--preload=packages/env/polyfill.ts", "main.ts"]
```

## Security Best Practices

1. **Never commit `.env.*` files** (except `.env.*.example`)
2. **Always separate client/server variables**
3. **Use TypeScript** - It prevents accessing server vars in client code
4. **Audit `.env.client`** - Ensure no secrets leak to browser

## Troubleshooting

### "Variable undefined" in browser

- Check variable is in `.env.client.example` (not `.env.server.example`)
- Run `bft sitevar sync` to update `.env.client`
- Restart Vite dev server

### "Variable undefined" in Deno

- Ensure polyfill is loaded: `--preload=packages/env/polyfill.ts`
- Check variable exists in `.env.client` or `.env.server`
- System env vars override file values

### Type errors after adding variables

- Run `bft sitevar sync` to regenerate types
- Restart TypeScript language server

## Key Features

1. **Single source of truth** - Example files define all variables
2. **Type safety** - Full TypeScript support with environment awareness
3. **Security by default** - Client can't access server variables
4. **Standard API** - Uses web standard `import.meta.env`
5. **Unified workflow** - One command syncs everything

The configuration system provides a secure, type-safe way to manage environment
variables across client and server environments.

## Next Steps for Implementation

### 1. Create Example Environment Files

Define which variables belong in client vs server contexts:

- Create `.env.client.example` with public variables
- Create `.env.server.example` with private variables
- Document each variable's purpose

### 2. Build the Vite Plugin

Implement `packages/env/vite-plugin.ts` to:

- Load only client-safe variables
- Inject them at build time
- Ensure server variables never reach the browser

### 3. Implement BFT Sitevar Command

Create `infra/bft/tasks/sitevar.bft.ts` to:

- Read variables from example files
- Fetch from 1Password using `op` CLI
- Write to appropriate `.env.*` files
- Generate TypeScript definitions

### 4. Add Type Generation

Build `packages/env/generate-types.ts` to:

- Parse example files
- Generate environment-aware TypeScript interfaces
- Create `env.d.ts` at monorepo root

### 5. Migrate Existing Code

- Identify current configuration system usage
- Update imports to use polyfill
- Replace configuration calls with `import.meta.env`
- Update build configurations
