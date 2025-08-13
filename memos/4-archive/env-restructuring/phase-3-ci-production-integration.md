# Phase 3: CI/CD and Production Integration

## Prerequisites

- Phase 1 and 2 must be complete and tested locally:
  - Files renamed to `.env.config` and `.env.secrets`
  - 1Password tag-based querying working
  - `injectEnvironment` function implemented and tested
  - At least one app using the new pattern successfully

## Implementation Plan

### Step 1: CI/CD Environment Setup

1. Configure 1Password access for CI/CD:
   - Create service account in 1Password with read access to CI vault
   - Generate service account token and store as `OP_SERVICE_ACCOUNT_TOKEN`
   - This token provides access to the CI vault only
   - Store this token in GitHub Actions secrets / CI provider secrets

2. Update GitHub Actions workflows to handle new env structure:
   - Use `OP_SERVICE_ACCOUNT_TOKEN` to authenticate with 1Password
   - Run `bft sitevar sync --vault=ci` to generate `.env.config` and
     `.env.secrets` files during CI runs
   - If vault sync fails, CI should create empty env files (current behavior)
   - Continue using existing deployment patterns during transition

### Step 2: Production Deployment Configuration

1. Update deployment scripts to:
   - Use production service account token
   - Run `bft sitevar sync --vault=production` during deployment
   - Continue using existing patterns for now (gradual migration)
   - Ensure backwards compatibility with `getConfigurationVariable`
   - Validate that only client-safe variables are in `window.__ENVIRONMENT__`

### Step 3: Docker and Container Updates

1. Update container build process:
   - Ensure Deno loads renamed env files automatically
   - No changes needed to Dockerfiles initially (Deno handles .env loading)
   - Validate that secrets aren't exposed in built images

### Step 4: Vault Configuration

1. Ensure all environments have proper vault setup:
   - Development vault: For local development
   - CI vault: For continuous integration
   - Production vault: For production deployments
2. Each vault must have items tagged with:
   - `BF_PUBLIC_CONFIG` for client-safe values
   - `BF_PRIVATE_SECRET` for server-only secrets
3. Manual updates in 1Password UI for now

### Step 5: CI Validation of Vault Contents

1. Add CI job to validate vault completeness:
   - Compare development vault against CI vault
   - Compare development vault against production vault
   - Ensure all `BF_PUBLIC_CONFIG` and `BF_PRIVATE_SECRET` tagged items exist in
     all vaults
   - Log warnings for missing variables but don't fail CI (all vars are
     optional)
   - Run as part of regular CI pipeline to catch configuration drift early

### Step 6: Runtime Monitoring and Validation

1. Add checks to ensure:
   - No secrets appear in client bundles
   - Environment injection works correctly in production
   - Log warnings for missing env vars (but don't fail - all vars are optional)

### Step 7: Production Readiness

1. No rollback plan needed - fix forward approach
2. Ensure monitoring for missing environment variables
3. Document troubleshooting steps for common issues

## Files to Update

- `/.github/workflows/*.yml` - GitHub Actions workflows
- `/infra/terraform/*.tf` - Infrastructure as code updates
- `/Dockerfile` and related container configs
- Deployment scripts in `/infra/scripts/`
- Production monitoring and health checks
- CI/CD configuration files for your platform
- Note: `--vault` flag should already be implemented in Phase 1

## Verification Checklist

- [ ] Service account tokens configured for CI and production
- [ ] CI builds successfully generate env files from CI vault
- [ ] Production deployments successfully use production vault
- [ ] Vault comparison job shows any missing variables between environments
- [ ] No breaking changes - `getConfigurationVariable` still works
- [ ] Client bundles only contain values from `.env.config`
- [ ] All three vaults properly configured with tagged items
- [ ] Graceful fallback when 1Password is unavailable
- [ ] Documentation updated for ops team
