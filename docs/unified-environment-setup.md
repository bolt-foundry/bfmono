# Unified Environment Setup with Nix

This document explains how we've unified environment setup across development
(host), CI, and containers using Nix flakes.

## Overview

All environments now use the same Nix flake configuration to ensure consistency:

- **Host Development**: Uses `nix develop` or `direnv` with `.envrc`
- **CI (GitHub Actions)**: Uses `nix develop .#github-actions`
- **Containers**: Built with `Dockerfile.nix` using Nix internally

## Key Components

### 1. Flake.nix Configuration

The flake defines multiple shell environments:

- `default` / `everything`: Full development environment
- `github-actions`: CI environment with automatic vault selection
- `container`: Minimal container environment
- `production`: Production-like environment

Each shell automatically:

1. Syncs environment variables from 1Password (if `OP_SERVICE_ACCOUNT_TOKEN` is
   set)
2. Loads `.env.config` and `.env.secrets` files
3. Sets up PATH and other environment variables

### 2. Environment Variable Management

Environment variables are managed through `bft sitevar`:

- Stored in 1Password with vault-specific values
- Synced to `.env.config` (public) and `.env.secrets` (private) files
- Auto-synced when entering Nix shell (if token available)

### 3. Usage

#### Local Development

```bash
# Using direnv (automatic)
cd /path/to/bfmono
# Environment loads automatically via .envrc

# Using nix develop manually
nix develop
# Or specific environment
nix develop .#production
```

#### CI (GitHub Actions)

```yaml
- name: Run tests
  run: |
    nix develop .#github-actions --command bash -c "
      bft test
    "
```

The CI environment:

- Uses `OP_SERVICE_ACCOUNT_TOKEN` from GitHub secrets
- Automatically syncs from the CI vault
- All commands run within the Nix shell

#### Building Containers

```bash
# Build OCI-compliant container with Nix
docker build \
  -f infra/Dockerfile.nix \
  --build-arg BINARY_NAME=boltfoundry-com \
  --build-arg VAULT_NAME=production \
  --secret id=op_token,env=OP_SERVICE_ACCOUNT_TOKEN \
  -t myapp:latest .
```

The container:

- Uses Nix internally for consistent build environment
- Syncs environment variables during build
- Produces minimal runtime image with env files baked in

## Vault Configuration

Different environments use different 1Password vaults:

- **development**: Local development secrets
- **ci**: CI/testing secrets
- **production**: Production secrets

Set vault explicitly:

```bash
# Sync from specific vault
bft sitevar sync --vault production

# Or set default vault
export BF_VAULT_ID=<vault-uuid>
```

## Benefits

1. **Consistency**: Same tools and versions everywhere
2. **Security**: Secrets managed through 1Password
3. **Simplicity**: One configuration to maintain
4. **Caching**: Nix provides deterministic caching
5. **OCI Compliance**: Containers are fully OCI-compliant

## Troubleshooting

### No environment variables loaded

- Check if `OP_SERVICE_ACCOUNT_TOKEN` is set
- Run `bft sitevar sync` manually
- Verify `.env.config` and `.env.secrets` exist

### Container build fails

- Ensure Docker BuildKit is enabled: `export DOCKER_BUILDKIT=1`
- Check if OP token is passed correctly as secret
- Verify Nix flake is valid: `nix flake check`

### Different values in different environments

- Check vault selection (development vs ci vs production)
- Verify with: `bft sitevar list`
- Sync specific vault: `bft sitevar sync --vault <name>`
