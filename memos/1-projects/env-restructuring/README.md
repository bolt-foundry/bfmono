# Environment Variable System Restructuring

This folder contains the implementation plans for restructuring our environment
variable and secrets management system.

## Current Status

**⚠️ Important**: This restructuring is in planning phase. The current codebase
uses:

- `getConfigurationVariable()` for environment access
- Proxy-based `env` object in `/packages/env/mod.ts` (to be removed)
- `.env.client` and `.env.server` files (not yet renamed)
- Basic 1Password integration without tag support

## Overview

The restructuring will migrate from the current system to a unified
`import.meta.env` approach in four phases:

### [Phase 1: Secrets Management](./phase-1-secrets-management.md)

- Rename `.env.client` → `.env.config` and `.env.server` → `.env.secrets` for
  clarity
- Implement vault-based approach with environment-specific vaults in 1Password
- Add tag-based querying (`BF_PUBLIC_CONFIG` and `BF_PRIVATE_SECRET`) within
  each vault
- Update `bft sitevar` command to support new tagging system
- Improve sync behavior to handle missing secrets gracefully

**Prerequisites**: None

### [Phase 2: Unified Environment Access](./phase-2-unified-env-access.md)

- Implement `injectEnvironment(import.meta)` for runtime environment injection
- Provide type-safe access via `import.meta.env`
- Remove proxy-based `env` implementation
- Unify browser environment handling (standardize on `window.__ENVIRONMENT__`)
- Update Vite plugin to support runtime injection instead of build-time
  replacement

**Prerequisites**: Phase 1 complete (files renamed, tags implemented)

### [Phase 3: CI/CD and Production Integration](./phase-3-ci-production-integration.md)

- Configure CI/CD pipelines for new env system
- Set up 1Password service accounts
- Update deployment scripts and Docker configurations
- Ensure production readiness with proper monitoring

**Prerequisites**: Phases 1-2 complete and tested locally

### [Phase 4: Legacy Code Cleanup](./phase-4-legacy-cleanup.md)

- Remove `getConfigurationVariable` package entirely
- Clean up old environment file references
- Update lint rules for migration (two-step approach)
- Remove deprecated code paths
- Ensure no manual env access remains

**Prerequisites**: Phases 1-3 complete and stable in production

## Goals

1. **Clarity**: File names and APIs that clearly indicate purpose
2. **Type Safety**: Full TypeScript support for all environment variables
3. **Developer Experience**: Consistent patterns and helpful error messages
4. **Security**: Clear separation between public config and private secrets
5. **Simplicity**: Single unified approach using native `import.meta.env`

## 1Password Vault Configuration

Vault UUIDs are stored in all vaults with the tag `BF_VAULT_CONFIG`:

- `BF_VAULT_UUID_DEVELOPMENT` - Development vault UUID
- `BF_VAULT_UUID_CI` - CI vault UUID
- `BF_VAULT_UUID_PRODUCTION` - Production vault UUID

Each vault uses the same tag system:

- `BF_PUBLIC_CONFIG` - For public configuration values safe for client exposure
- `BF_PRIVATE_SECRET` - For private secrets that must never reach the client
- `BF_VAULT_CONFIG` - For vault configuration metadata (in all vaults)

## Key Implementation Challenges

### TypeScript Type System Updates

The current `env.d.ts` declares `import.meta.env` as readonly, which conflicts
with runtime injection. We need to:

1. Update type definitions to allow runtime population of `import.meta.env`
2. Maintain type safety while supporting mutation during initialization
3. Ensure proper typing for both server (Deno) and browser environments

### Deno Runtime Considerations

Deno automatically loads `.env` files into `Deno.env` but doesn't populate
`import.meta.env`. The `injectEnvironment` function must:

1. Read from `Deno.env.toObject()` instead of parsing files directly
2. Handle the fact that Deno has already loaded `.env.local`, `.env.config`, and
   `.env.secrets`
3. Provide consistent behavior between development and production

### Browser Environment Unification

Currently three different patterns exist for browser env vars:

1. Vite's `define` build-time replacement
2. `globalThis.__ENVIRONMENT__` in `get-configuration-var`
3. Planned `window.__ENVIRONMENT__` approach

We need to standardize on `window.__ENVIRONMENT__` and update all tools
accordingly.

### Lint Rule Migration Strategy

To avoid circular migrations:

1. First migration: `Deno.env.get()` → `import.meta.env.VARIABLE`
2. Second migration: `getConfigurationVariable("VARIABLE")` →
   `import.meta.env.VARIABLE`
3. Remove the existing `no-env-direct-access` rule that promotes
   `getConfigurationVariable`

## Migration Path

The migration will be gradual with backwards compatibility:

1. **Phase 1**: Can coexist with current system (file renaming + 1Password tags)
2. **Phase 2**: Dual support period where both `getConfigurationVariable` and
   `import.meta.env` work
3. **Phase 3**: Production validation with both systems
4. **Phase 4**: Complete removal of old system

## Testing Requirements

Each phase must include:

1. Unit tests for new functionality
2. Integration tests for environment loading
3. E2E tests for both server and client environments
4. Migration tests to ensure backwards compatibility
