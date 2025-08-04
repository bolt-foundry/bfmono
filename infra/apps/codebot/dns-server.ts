#!/usr/bin/env deno run --allow-net --allow-run
// Simple DNS server for *.codebot.local resolution
/// <reference lib="deno.unstable" />

import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

class CodebotDNSServer {
  private containers = new Map<string, string>(); // name -> ip

  async start() {
    logger.debug("🚀 Starting DNS server on port 15353");

    // Update container IPs every 10 seconds
    setInterval(() => this.updateContainers(), 10000);
    await this.updateContainers();

    // Start UDP DNS server
    const listener = Deno.listenDatagram({
      port: 15353,
      transport: "udp",
    });

    logger.debug("📡 DNS server ready for *.codebot.local queries");

    for await (const [data, addr] of listener) {
      try {
        const response = this.handleDNSQuery(data);
        if (response) {
          await listener.send(response, addr);
        }
      } catch (error) {
        logger.debug("DNS error:", error);
      }
    }
  }

  private async updateContainers() {
    try {
      // Get running containers using container list
      const cmd = new Deno.Command("container", { args: ["list"] });
      const result = await cmd.output();

      if (!result.success) return;

      const output = new TextDecoder().decode(result.stdout);
      const lines = output.trim().split("\n").slice(1); // Skip header

      this.containers.clear();

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5) {
          const id = parts[0];
          const state = parts[4];
          const addr = parts[5];

          if (state === "running" && addr) {
            this.containers.set(id, addr);
            logger.debug(`📋 ${id} → ${addr}`);
          }
        }
      }
    } catch (error) {
      logger.debug("Error updating containers:", error);
    }
  }

  private async getContainerIP(name: string): Promise<string | null> {
    try {
      const cmd = new Deno.Command("container", {
        args: ["exec", name, "ifconfig", "eth0"],
      });
      const result = await cmd.output();

      if (result.success) {
        const output = new TextDecoder().decode(result.stdout);
        const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);
        return match?.[1] || null;
      }
    } catch {
      // Failed to get container IP
    }
    return null;
  }

  private handleDNSQuery(data: Uint8Array): Uint8Array | null {
    if (data.length < 12) return null;

    // Parse query name
    const offset = 12;
    const name = this.parseName(data, offset);
    if (!name || !name.endsWith(".codebot.local")) return null;

    logger.debug(`🔍 Query: ${name}`);

    // Look up container
    const containerName = name.replace(".codebot.local", "");
    const ip = this.containers.get(containerName);

    if (ip) {
      logger.debug(`✅ Resolved: ${name} → ${ip}`);
      return this.createResponse(data, ip);
    }

    logger.debug(`❌ Not found: ${name}`);
    return this.createNXDOMAIN(data);
  }

  private parseName(data: Uint8Array, offset: number): string | null {
    const parts: Array<string> = [];
    let current = offset;

    while (current < data.length) {
      const len = data[current];
      if (len === 0) break;
      if (len > 63) return null;

      current++;
      if (current + len > data.length) return null;

      parts.push(new TextDecoder().decode(data.slice(current, current + len)));
      current += len;
    }

    return parts.join(".");
  }

  private createResponse(query: Uint8Array, ip: string): Uint8Array {
    const response = new Uint8Array(query.length + 16);
    const view = new DataView(response.buffer);

    // Copy query
    response.set(query);

    // Set response flags (standard query response)
    const flags = view.getUint16(2);
    view.setUint16(2, (flags & 0x7800) | 0x8180);

    // Set answer count to 1
    view.setUint16(6, 1);

    // Add answer at end
    let offset = query.length;

    // Name pointer (points back to question name)
    view.setUint16(offset, 0xc00c);
    offset += 2;

    // Type A (1), Class IN (1)
    view.setUint16(offset, 1);
    view.setUint16(offset + 2, 1);
    offset += 4;

    // TTL (300 seconds)
    view.setUint32(offset, 300);
    offset += 4;

    // Data length (4 bytes for IPv4)
    view.setUint16(offset, 4);
    offset += 2;

    // IP address
    const parts = ip.split(".").map(Number);
    for (let i = 0; i < 4; i++) {
      view.setUint8(offset + i, parts[i]);
    }

    return response;
  }

  private createNXDOMAIN(query: Uint8Array): Uint8Array {
    const response = new Uint8Array(query);
    const view = new DataView(response.buffer);

    // Set NXDOMAIN response
    view.setUint16(2, 0x8183); // Response + NXDOMAIN

    return response;
  }
}

if (import.meta.main) {
  const server = new CodebotDNSServer();
  await server.start();
}
