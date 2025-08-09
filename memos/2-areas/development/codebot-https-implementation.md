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

### 1. Container Privilege Setup

Since authbind is not available in nixpkgs, use `setcap` (the NixOS-preferred
approach):

```dockerfile
# Update Dockerfile.infra sudoers configuration
RUN echo "codebot ALL=(ALL) NOPASSWD: /bin/cp * /etc/hosts, /usr/bin/tee /etc/hosts, /usr/bin/tee -a /etc/hosts, /usr/sbin/setcap cap_net_bind_service=+ep /usr/bin/deno, /usr/sbin/setcap cap_net_bind_service=+ep /nix/*/bin/deno" >> /etc/sudoers.d/codebot && \
    chmod 0440 /etc/sudoers.d/codebot
```

### 2. Certificate Management

Create a local CA and dynamic certificate generation system:

```typescript
// In container-bot-base.ts
async function ensureCertificates(): Promise<void> {
  const certDir = `${homeDir}/.codebot/certs`;
  const caCertPath = `${certDir}/ca.pem`;
  const caKeyPath = `${certDir}/ca-key.pem`;

  if (!await exists(caCertPath)) {
    await Deno.mkdir(certDir, { recursive: true });

    // Generate self-signed CA
    await generateCA(caCertPath, caKeyPath);

    // Install CA in system trust store
    if (Deno.build.os === "darwin") {
      await installCertMacOS(caCertPath);
    }
  }
}
```

### 3. HTTPS Proxy Server

Create `https-proxy-server.ts` that:

- Listens on ports 80/443 inside the container
- Dynamically generates certificates for each workspace
- Proxies requests to the appropriate services

```typescript
// apps/codebot/https-proxy-server.ts
import { serveTls } from "@std/http/server";

const proxy = Deno.serve({
  port: 443,
  cert: await Deno.readTextFile(certPath),
  key: await Deno.readTextFile(keyPath),
  handler: async (req) => {
    const hostname = new URL(req.url).hostname;
    const workspace = hostname.replace(".codebot.local", "");

    // Get or generate certificate for this workspace
    const { cert, key } = await getOrGenerateCert(workspace);

    // Proxy to appropriate service
    return await proxyRequest(req, workspace);
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
deno run --allow-net --allow-read --allow-write \
  /internalbf/bfmono/infra/apps/codebot/https-proxy-server.ts &
```

### 5. Port Mapping Updates

Update container creation to map HTTPS port:

```typescript
// In buildContainerArgs
"-p", `${config.httpPort || 9280}:80`,
"-p", `${config.httpsPort || 9283}:443`,
```

## Benefits

1. Seamless HTTPS support without certificate warnings
2. No need for sudo when running servers
3. Each workspace gets its own certificate
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
