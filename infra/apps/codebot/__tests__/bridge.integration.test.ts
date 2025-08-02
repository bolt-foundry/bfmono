import { assertEquals, assertExists } from "@std/assert";
import { delay } from "@std/async";
import { startHostBridge } from "../host-bridge.ts";
import { startContainerBridge } from "../container-bridge.ts";

// Mock fetch to prevent actual browser opens
const originalFetch = globalThis.fetch;

Deno.test("host bridge - ping/pong endpoint", async () => {
  const port = 9018;
  const server = startHostBridge(port);

  try {
    // Wait for server to start
    await delay(100);

    // Test /pong endpoint
    const response = await fetch(`http://localhost:${port}/pong`);
    assertEquals(response.status, 200);

    const data = await response.json();
    assertEquals(data.pong, true);
    assertEquals(data.from, "host");
    assertExists(data.timestamp);
  } finally {
    await server.shutdown();
  }
});

Deno.test("host bridge - browser open endpoint", async () => {
  let browserOpenCalled = false;
  let openedUrl = "";

  // Mock Deno.Command to capture browser open
  const originalCommand = Deno.Command;
  Deno.Command = class MockCommand {
    constructor(public cmd: string, public options?: { args?: Array<string> }) {
      if (cmd === "open" || cmd === "xdg-open") {
        browserOpenCalled = true;
        openedUrl = options?.args?.[0] || "";
      }
    }

    spawn() {
      return {
        status: Promise.resolve({ success: true, code: 0, signal: null }),
      };
    }

    output() {
      return Promise.resolve({
        success: true,
        code: 0,
        signal: null,
        stdout: new Uint8Array(),
        stderr: new Uint8Array(),
      });
    }

    outputSync() {
      return {
        success: true,
        code: 0,
        signal: null,
        stdout: new Uint8Array(),
        stderr: new Uint8Array(),
      };
    }
  } as unknown as typeof Deno.Command;

  const port = 9019;
  const server = startHostBridge(port);

  try {
    await delay(100);

    // Test /browser/open endpoint
    const response = await fetch(`http://localhost:${port}/browser/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://test.codebot.local:8000" }),
    });

    assertEquals(response.status, 200);
    const data = await response.json();
    assertEquals(data.success, true);

    // Verify browser open was called
    assertEquals(browserOpenCalled, true);
    assertEquals(openedUrl, "http://test.codebot.local:8000");
  } finally {
    Deno.Command = originalCommand;
    await server.shutdown();
  }
});

Deno.test("host bridge - 404 for unknown endpoints", async () => {
  const port = 9020;
  const server = startHostBridge(port);

  try {
    await delay(100);

    const response = await fetch(`http://localhost:${port}/unknown`);
    assertEquals(response.status, 404);
    await response.text(); // Consume response body
  } finally {
    await server.shutdown();
  }
});

Deno.test("container bridge - status endpoint", async () => {
  // Set workspace ID for testing
  Deno.env.set("WORKSPACE_ID", "test-workspace");

  const port = 9021;
  const server = startContainerBridge(port);

  try {
    await delay(100);

    // Test /status endpoint
    const response = await fetch(`http://localhost:${port}/status`);
    assertEquals(response.status, 200);

    const data = await response.json();
    assertEquals(data.ready, true);
    assertEquals(data.workspaceId, "test-workspace");
    assertExists(data.services);
    assertExists(data.services["boltfoundry-com"]);
    assertEquals(data.services["boltfoundry-com"].status, "not started");
    assertEquals(data.services["boltfoundry-com"].healthy, false);
  } finally {
    await server.shutdown();
    Deno.env.delete("WORKSPACE_ID");
  }
});

Deno.test("container bridge - ping endpoint with host connectivity", async () => {
  let hostPongCalled = false;

  // Mock fetch to simulate host bridge response
  globalThis.fetch = (
    url: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    if (url.toString().includes("host.codebot.local:8017/pong")) {
      hostPongCalled = true;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            pong: true,
            from: "host",
            timestamp: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      );
    }
    return originalFetch(url, init);
  };

  Deno.env.set("WORKSPACE_ID", "test-workspace");
  const port = 9022;
  const server = startContainerBridge(port);

  try {
    await delay(100);

    // Test /ping endpoint
    const response = await fetch(`http://localhost:${port}/ping`);
    assertEquals(response.status, 200);

    const data = await response.json();
    assertEquals(data.pong, true);
    assertEquals(data.workspaceId, "test-workspace");
    assertExists(data.timestamp);
    assertExists(data.hostPong);
    assertEquals(data.hostPong.pong, true);
    assertEquals(data.hostPong.from, "host");

    // Verify host was pinged
    assertEquals(hostPongCalled, true);
  } finally {
    globalThis.fetch = originalFetch;
    await server.shutdown();
    Deno.env.delete("WORKSPACE_ID");
  }
});

Deno.test("container bridge - ping endpoint with host error", async () => {
  // Mock fetch to simulate host bridge error
  globalThis.fetch = (
    url: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    if (url.toString().includes("host.codebot.local:8017/pong")) {
      return Promise.reject(new Error("Connection refused"));
    }
    return originalFetch(url, init);
  };

  Deno.env.set("WORKSPACE_ID", "test-workspace");
  const port = 9023;
  const server = startContainerBridge(port);

  try {
    await delay(100);

    // Test /ping endpoint with host error
    const response = await fetch(`http://localhost:${port}/ping`);
    assertEquals(response.status, 200);

    const data = await response.json();
    assertEquals(data.pong, true);
    assertExists(data.hostError);
    assertEquals(data.hostError, "Connection refused");
  } finally {
    globalThis.fetch = originalFetch;
    await server.shutdown();
    Deno.env.delete("WORKSPACE_ID");
  }
});

// Skip bidirectional test since both bridges use the same port
// In real usage, they run on different network namespaces (host vs container)
Deno.test({
  name: "bidirectional communication - endpoints exist",
  fn: async () => {
    // Test that we can create both servers independently
    const hostPort = 9024;
    const hostServer = startHostBridge(hostPort);
    await delay(100);

    // Verify host bridge endpoints
    const pongResponse = await fetch(`http://localhost:${hostPort}/pong`);
    assertEquals(pongResponse.status, 200);
    await pongResponse.text();

    await hostServer.shutdown();
    await delay(100);

    // Now test container bridge
    Deno.env.set("WORKSPACE_ID", "test-workspace");
    const containerPort = 9025;
    const containerServer = startContainerBridge(containerPort);
    await delay(100);

    // Verify container bridge endpoints
    const statusResponse = await fetch(
      `http://localhost:${containerPort}/status`,
    );
    assertEquals(statusResponse.status, 200);
    const statusData = await statusResponse.json();
    assertEquals(statusData.ready, true);

    await containerServer.shutdown();
    Deno.env.delete("WORKSPACE_ID");
  },
});
