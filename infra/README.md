# Infrastructure Dockerfiles

This directory contains standardized Dockerfiles for the Bolt Foundry monorepo.

## Dockerfile.infra

The infrastructure Dockerfile used for development containers like codebot. It
includes:

- Nix package manager with flake support
- Chrome/Chromium for E2E testing
- Claude CLI
- All development tools defined in the flake

### Building

```bash
# Using bft codebot build
bft codebot build

# Or manually from internalbf directory
docker build -t codebot -f bfmono/infra/Dockerfile.infra .
```

## Dockerfile.deploy

A minimal deployment Dockerfile for production services. It uses build arguments
to specify the binary to deploy.

### Usage Example

```bash
# Build your application first
deno compile --output build/myapp src/main.ts

# Build the deployment container from internalbf directory
docker build \
  --build-arg BINARY_PATH=bfmono/build/myapp \
  --build-arg BINARY_NAME=myapp \
  -t myapp:latest \
  -f bfmono/infra/Dockerfile.deploy \
  .

# Run the container
docker run -p 8000:8000 myapp:latest
```

### Build Arguments

- `BINARY_PATH`: Path to the compiled binary relative to build context
- `BINARY_NAME`: Name for the binary in the container (used in CMD)

The deployment container:

- Runs as non-root user
- Includes only minimal dependencies (ca-certificates)
- Exposes port 8000 by default
- Uses debian:bookworm-slim as base
