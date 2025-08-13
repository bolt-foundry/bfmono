# Phase 4: Legacy Code Cleanup

## Prerequisites

- Phases 1, 2, and 3 must be complete and stable:
  - New environment system tested in production
  - Multiple apps successfully using `injectEnvironment` pattern
  - CI/CD pipelines working with new vault-based system
  - Team comfortable with new patterns

## Implementation Plan

### Step 1: Prepare for Migration

1. Audit current usage patterns:
   - Count occurrences of `getConfigurationVariable`
   - Find direct `Deno.env.get()` calls
   - Identify `globalThis.__ENVIRONMENT__` usage (to be migrated to
     `window.__ENVIRONMENT__`)
   - Note any dynamic variable access patterns

2. Two-phase lint rule approach:
   - Phase A: Migrate `Deno.env.get()` → `import.meta.env`
   - Phase B: Migrate `getConfigurationVariable()` → `import.meta.env`

### Step 2: Implement Lint Rules

1. Update existing `no-env-direct-access` rule to support new patterns
2. Add new migration rules to `/infra/lint/bolt-foundry.ts`:

```typescript
// Pattern 1: getConfigurationVariable
const value = getConfigurationVariable("MY_VAR");
// Auto-fixes to:
const value = import.meta.env.MY_VAR;

// Pattern 2: Direct globalThis.__ENVIRONMENT__ access
const value = globalThis.__ENVIRONMENT__.MY_VAR;
// Auto-fixes to:
const value = import.meta.env.MY_VAR;

// Pattern 3: Deno.env.get
const value = Deno.env.get("MY_VAR");
// Auto-fixes to:
const value = import.meta.env.MY_VAR;

// Pattern 4: Add injectEnvironment when needed
// When converting to import.meta.env, add at top of file:
import { injectEnvironment } from "@bfmono/packages/env/inject.ts";
injectEnvironment(import.meta);

// Note: Only add if file doesn't already have it
```

### Step 3: Execute Migration

1. Phase A - Migrate direct env access:
   - Enable first lint rule
   - Run `bft lint --fix`
   - Test and commit

2. Phase B - Migrate getConfigurationVariable:
   - Enable second lint rule
   - Run `bft lint --fix`
   - Review changes carefully
   - Handle edge cases:
     - Dynamic variable names
     - Conditional access patterns
     - Test-specific usage

3. Verify everything works:
   - All tests pass
   - Apps run correctly
   - No runtime errors

### Step 4: Remove Legacy Code

1. Delete the proxy-based env implementation:
   - Remove `/packages/env/mod.ts` (proxy implementation)
   - Remove `/packages/env/compat.ts` if it exists
   - Keep only `/packages/env/inject.ts` and related files

2. Delete get-configuration-var package:
   - Remove `/packages/get-configuration-var/` entirely
   - Update import maps in `deno.jsonc`

### Step 5: Documentation and Cleanup

1. Update all documentation
2. Remove `.env.client.example` and `.env.server.example` (now using
   `.env.config.example` and `.env.secrets.example`)
3. Update developer onboarding guides
4. Archive old patterns in documentation

## Files to Remove/Update

- `/packages/get-configuration-var/` - Entire package
- `/packages/env/mod.ts` - Proxy-based implementation
- `/packages/env/compat.ts` - Compatibility layer if exists
- All imports of `getConfigurationVariable`
- Direct `Deno.env.get()` calls
- `globalThis.__ENVIRONMENT__` references
- Old example files (`.env.client.example`, `.env.server.example`)
- Outdated lint rules promoting `getConfigurationVariable`

## Verification Checklist

- [ ] All `getConfigurationVariable` calls migrated
- [ ] All `Deno.env.get()` calls migrated
- [ ] Proxy-based env implementation removed
- [ ] get-configuration-var package deleted
- [ ] All apps use `injectEnvironment(import.meta)` pattern
- [ ] No references to old file names remain
- [ ] Lint rules updated to enforce new patterns
- [ ] Documentation reflects new patterns only
- [ ] All tests pass
- [ ] Production deployment successful
