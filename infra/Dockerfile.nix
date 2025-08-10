# Multi-stage OCI-compliant Dockerfile using Nix for consistent environment setup
# This ensures dev, CI, and container environments all use the same setup
# syntax=docker/dockerfile:1

# Stage 1: Build environment with Nix
FROM nixos/nix:latest AS builder

# Enable flakes and disable sandboxing for container builds
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf && \
    echo "sandbox = false" >> /etc/nix/nix.conf

# Set working directory
WORKDIR /workspace

# Copy flake files first for better caching
COPY flake.nix flake.lock ./

# Pre-download dependencies (cache layer)
RUN nix develop .#container --accept-flake-config --command echo "Dependencies cached"

# Copy env example files needed for sitevar
COPY .env.config.example .env.secrets.example ./

# Copy the entire workspace
COPY . .

# Build arguments
ARG OP_SERVICE_ACCOUNT_TOKEN
ARG BINARY_NAME=boltfoundry-com
ARG VAULT_NAME=production

# Run build in nix shell
RUN --mount=type=secret,id=op_token \
    export OP_SERVICE_ACCOUNT_TOKEN="$(cat /run/secrets/op_token 2>/dev/null || echo '')" && \
    nix develop .#container --accept-flake-config --command bash -c "\
    # Sync environment variables from 1Password if token is provided \
    if [ -n \"$OP_SERVICE_ACCOUNT_TOKEN\" ]; then \
      echo 'Syncing sitevars from 1Password vault: ${VAULT_NAME}'; \
      bft sitevar sync --force --vault ${VAULT_NAME} || echo 'Warning: sitevar sync failed'; \
    else \
      echo 'No OP_SERVICE_ACCOUNT_TOKEN provided, using example env files'; \
    fi; \
    # Ensure env files exist (use examples as fallback) \
    if [ ! -f .env.config ]; then \
      echo 'Creating .env.config from example...'; \
      cp .env.config.example .env.config || echo '# Empty config' > .env.config; \
    fi; \
    if [ ! -f .env.secrets ]; then \
      echo 'Creating .env.secrets from example...'; \
      cp .env.secrets.example .env.secrets || echo '# Empty secrets' > .env.secrets; \
    fi; \
    # Build the binary \
    echo 'Building ${BINARY_NAME}...'; \
    bft compile ${BINARY_NAME}; \
    "

# Stage 2: Runtime environment (minimal)
FROM debian:bookworm-slim

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -s /bin/false app

# Create data directory if needed
RUN mkdir -p /data && chown app:app /data

# Copy the compiled binary from builder
ARG BINARY_NAME=boltfoundry-com
COPY --from=builder /workspace/build/${BINARY_NAME} /usr/local/bin/${BINARY_NAME}
RUN chmod +x /usr/local/bin/${BINARY_NAME}

# Copy environment files from builder (these were synced from 1Password or created from examples)
# Use conditional copy pattern to handle missing files gracefully
COPY --from=builder /workspace/.env.* /tmp/
RUN mkdir -p /app && \
    if [ -f /tmp/.env.config ]; then mv /tmp/.env.config /app/.env.config; else echo '# Empty config' > /app/.env.config; fi && \
    if [ -f /tmp/.env.secrets ]; then mv /tmp/.env.secrets /app/.env.secrets; else echo '# Empty secrets' > /app/.env.secrets; fi && \
    rm -f /tmp/.env.*

# Set working directory
WORKDIR /app

# Switch to non-root user
USER app

# Default port (can be overridden)
EXPOSE 8000

# Set the binary name as environment variable
ENV BINARY_NAME=${BINARY_NAME}

# Load environment variables and run the binary
CMD ["/bin/sh", "-c", "\
    if [ -f /app/.env.config ]; then \
      set -a; . /app/.env.config; set +a; \
    fi; \
    if [ -f /app/.env.secrets ]; then \
      set -a; . /app/.env.secrets; set +a; \
    fi; \
    exec /usr/local/bin/${BINARY_NAME}"]