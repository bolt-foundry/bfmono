# Phase 1: Secrets Management

## Prerequisites

- 1Password CLI installed and authenticated
- Access to development vault (minimum requirement)
- Current system still functioning (this phase coexists with existing system)

## Implementation Plan

### Step 1: File Renaming

1. Rename physical files
2. Update all code references
3. Update documentation

### Step 2: Update Type Generation

1. Keep existing type generation from example files for now (backwards
   compatibility)
2. Add new type generation as part of `bft secrets sync` that reads from vault
3. Generated types will go to `/env.d.ts` (existing location)

### Step 3: Refactor Secrets Sync

1. Modify `/infra/bft/tasks/secrets.bft.ts`:
   - Use vault-based approach with environment-specific vaults
   - First fetch vault UUIDs from current vault (items tagged `BF_VAULT_CONFIG`)
   - Query items by tag (`BF_PUBLIC_CONFIG` and `BF_PRIVATE_SECRET`) within the
     selected vault
   - When 1Password is unavailable:
     - DO NOT create empty files
     - Log a warning that 1Password sync failed
     - Rely on Deno's env loading order (example files will be loaded)
   - Keep `.env.config.example` and `.env.secrets.example` checked into repo
     with safe default values
   - Only write `.env.config` and `.env.secrets` when 1Password sync succeeds
   - Add proper feedback for synced/skipped items
   - Log warnings but don't fail the process (graceful degradation)
   - Support `--vault` flag to select which vault to sync from (e.g.,
     `bft secrets sync --vault=production`)
   - Vault selection priority: 1) `--vault` flag, 2) `BF_VAULT_ID` env var, 3)
     default to development vault
   - Generate TypeScript types during sync (continue writing to `/env.d.ts`)

### Step 4: Update 1Password Vault

1. Tag existing items appropriately in each vault:
   - `BF_PUBLIC_CONFIG` for public configuration values
   - `BF_PRIVATE_SECRET` for private secrets
2. Store default values in 1Password items for developers without vault access
3. Document vault-based approach and tagging convention
4. Note: Production vault access is restricted and managed out-of-band

### Step 5: Configure Environment Loading

1. Update `.envrc` to load files in the correct order:
   ```bash
   # Load in this order (later overrides earlier)
   source_env_if_exists .env.config.example  # Safe defaults
   source_env_if_exists .env.secrets.example  # Safe defaults
   source_env_if_exists .env.config          # From 1Password
   source_env_if_exists .env.secrets         # From 1Password
   source_env_if_exists .env.local           # User overrides
   ```

2. This approach means:
   - Developers without 1Password access get example values
   - Developers with 1Password get real values overlaid on examples
   - `.env.local` provides final overrides
   - No empty files are created - missing files are simply skipped

## Files to Update

- `/infra/bft/tasks/secrets.bft.ts` - Main sync logic
- `/packages/env/generate-types.ts` - Type generation
- `/packages/env/README.md` - Documentation
- `/packages/env/__tests__/*.test.ts` - Tests
- `/.envrc` - Update direnv configuration
- `/flake.nix` - Update if any env file references exist
- Example files: Create `.env.config.example` and `.env.secrets.example` from
  existing `.env.client.example` and `.env.server.example`
- All references to `.env.client` and `.env.server` throughout codebase (rename
  to `.env.config` and `.env.secrets`)

## Verification Checklist

- [ ] All files renamed from `.env.client` to `.env.config` and `.env.server` to
      `.env.secrets`
- [ ] Example files created: `.env.config.example` and `.env.secrets.example`
- [ ] Type generation continues to work with new file names
- [ ] Secrets sync updated to support tag-based queries
- [ ] Tags added to 1Password items: `BF_PUBLIC_CONFIG` and `BF_PRIVATE_SECRET`
- [ ] TypeScript types still generated to `/env.d.ts`
- [ ] `--vault` flag works for vault selection
- [ ] Deno loads renamed env files automatically
- [ ] All code references updated to new file names
- [ ] Existing `getConfigurationVariable` still works (backwards compatibility)

## Phase Completion Criteria

Phase 1 is complete when:

- All env files are renamed and working
- `bft secrets sync` successfully generates types and env files using tags
- Existing functionality still works (backwards compatibility)
- 1Password items are properly tagged
- At least one developer has successfully used the new sync command
