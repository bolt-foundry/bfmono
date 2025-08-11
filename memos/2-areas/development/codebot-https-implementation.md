# Codebot HTTPS Support Implementation Plan

**Date**: 2025-08-09\
**Status**: Planning\
**Related**: bft codebot DNS proxy functionality

## Overview

Add HTTPS support to bft codebot's DNS proxy system, allowing containers to be
accessed via `https://<workspace-name>.codebot.local` URLs.

## Current State

- Codebot creates isolated containers with unique workspace names (e.g.,
  `fuzzy-goat`)
- Containers are accessible via `http://<workspace-name>.codebot.local:9280`
- DNS server component referenced but not implemented
- Container runs as `codebot` user (non-root)
- Existing sudo rules allow `/etc/hosts` modifications

## Implementation Plan

### Confirmed Architecture

Based on discussion:

- HTTPS proxy listens on port 443 inside container (host already maps this)
- HTTP server on port 80 redirects to HTTPS
- Proxy routes requests:
  - Vite dev server assets/HMR → port 8080 (or 5173)
  - API/pages → backend server port 8000
- No additional port mapping needed on host

### 1. Container Privilege Setup

Since authbind is not available in nixpkgs, use `setcap` (the NixOS-preferred
approach):

```dockerfile
# Update Dockerfile.infra sudoers configuration
RUN echo "codebot ALL=(ALL) NOPASSWD: /bin/cp * /etc/hosts, /usr/bin/tee /etc/hosts, /usr/bin/tee -a /etc/hosts, /usr/sbin/setcap cap_net_bind_service=+ep /usr/bin/deno, /usr/sbin/setcap cap_net_bind_service=+ep /nix/*/bin/deno" >> /etc/sudoers.d/codebot && \
    chmod 0440 /etc/sudoers.d/codebot
```

### 2. Certificate Management

Create a wildcard certificate for `*.codebot.local`:

```typescript
// In container-bot-base.ts (runs on host)
async function ensureWildcardCertificate(): Promise<void> {
  // Store certificates in shared folder for host-container communication
  const sharedCertDir = `${homeDir}/internalbf/bfmono/shared/certs`;
  const wildcardCertPath = `${sharedCertDir}/codebot-wildcard.pem`;
  const wildcardKeyPath = `${sharedCertDir}/codebot-wildcard-key.pem`;

  if (!await exists(wildcardCertPath)) {
    await Deno.mkdir(sharedCertDir, { recursive: true });

    // Generate self-signed wildcard certificate for *.codebot.local
    await generateWildcardCert(wildcardCertPath, wildcardKeyPath);

    // Trust the certificate in the system keychain (on host)
    await trustCertificate(wildcardCertPath);

    console.log("Certificate generated and trusted for HTTPS support");
  }
}

async function trustCertificate(certPath: string): Promise<void> {
  if (Deno.build.os === "darwin") {
    // macOS: Add to system keychain and trust
    const command = new Deno.Command("sudo", {
      args: [
        "security",
        "add-trusted-cert",
        "-d",
        "-r",
        "trustRoot",
        "-k",
        "/Library/Keychains/System.keychain",
        certPath,
      ],
    });
    await command.output();
  } else if (Deno.build.os === "linux") {
    // Linux: Copy to system trust store
    const command = new Deno.Command("sudo", {
      args: [
        "cp",
        certPath,
        "/usr/local/share/ca-certificates/codebot-wildcard.crt",
      ],
    });
    await command.output();

    // Update CA certificates
    const updateCommand = new Deno.Command("sudo", {
      args: ["update-ca-certificates"],
    });
    await updateCommand.output();
  }

  console.log("Certificate trusted. You may need to restart your browser.");
}
```

### 3. HTTPS Proxy Server

Create `https-proxy-server.ts` that:

- Listens on ports 80/443 inside the container
- Uses the wildcard certificate for all requests
- Proxies requests to the appropriate services

```typescript
// infra/apps/codebot/https-proxy-server.ts (runs inside container)
import { serveTls } from "@std/http/server";

// Load wildcard certificate from shared folder
const certPath = "/internalbf/bfmono/shared/certs/codebot-wildcard.pem";
const keyPath = "/internalbf/bfmono/shared/certs/codebot-wildcard-key.pem";

// Known backend routes from boltfoundry-com
const backendRoutes = new Set([
  // App routes
  "/",
  "/login",
  "/rlhf",
  "/eval",
  "/plinko",
  "/ui",
  // API routes
  "/health",
  "/api/telemetry",
  "/graphql",
  "/api/auth/google",
  "/api/auth/dev-popup",
]);

const backendPatterns = [
  /^\/ui\/.*/, // /ui/* routes
  /^\/static\/.*/, // Static assets served by backend
];

function shouldRouteToBackend(pathname: string): boolean {
  // Check exact routes
  if (backendRoutes.has(pathname)) return true;

  // Check patterns
  for (const pattern of backendPatterns) {
    if (pattern.test(pathname)) return true;
  }

  return false;
}

const httpsProxy = Deno.serve({
  port: 443,
  cert: await Deno.readTextFile(certPath),
  key: await Deno.readTextFile(keyPath),
  handler: async (req) => {
    const url = new URL(req.url);
    const targetPort = shouldRouteToBackend(url.pathname) ? 8000 : 8080;

    // Proxy to the appropriate service
    const targetUrl = new URL(url);
    targetUrl.protocol = "http:";
    targetUrl.port = String(targetPort);

    return await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  },
});

// HTTP redirect server
const httpRedirect = Deno.serve({
  port: 80,
  handler: (req) => {
    const url = new URL(req.url);
    return Response.redirect(
      `https://${url.host}${url.pathname}${url.search}`,
      301,
    );
  },
});
```

### 4. Container Startup Integration

Update the entrypoint script to:

1. Set capability on deno binary
2. Start HTTPS proxy server

```bash
# In docker-entrypoint.sh
# Grant deno capability to bind to privileged ports
sudo setcap cap_net_bind_service=+ep $(which deno)

# Start HTTPS proxy in background
bft proxy --start
```

### 5. No Port Mapping Changes Needed

The existing codebot container setup already maps the necessary ports, so no
changes are required to the port mapping configuration.

## Benefits

1. Simple wildcard certificate covers all workspaces
2. No need for sudo when running servers
3. Single certificate generation and management
4. Compatible with existing DNS resolution

## Testing Plan

1. Build updated container with new Dockerfile
2. Test certificate generation and installation
3. Verify HTTPS proxy can bind to port 443
4. Test accessing a workspace via HTTPS
5. Ensure HTTP continues to work

## Future Enhancements

1. Support for custom domains beyond `.codebot.local`
2. Let's Encrypt integration for public domains
3. Certificate management UI
4. WebSocket proxy support for development servers

## Implementation Steps

1. [ ] Update Dockerfile.infra with setcap sudo rules
2. [ ] Implement certificate generation utilities
3. [ ] Create HTTPS proxy server
4. [ ] Update container startup scripts
5. [ ] Test with multiple workspaces
6. [ ] Update documentation and help text
