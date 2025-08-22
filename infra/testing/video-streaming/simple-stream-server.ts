import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface StreamClient {
  controller: ReadableStreamDefaultController;
  id: string;
}

class SimpleStreamServer {
  private clients: Set<StreamClient> = new Set();
  private latestFrame: Uint8Array | null = null;

  // Handle SSE connection for streaming
  handleStreamRequest(req: Request): Response {
    const stream = new ReadableStream({
      start: (controller) => {
        const client: StreamClient = {
          controller,
          id: crypto.randomUUID(),
        };

        this.clients.add(client);
        logger.info(
          `Stream client connected: ${client.id} (${this.clients.size} total)`,
        );

        // Send latest frame immediately if available
        if (this.latestFrame) {
          this.sendFrameToClient(client, this.latestFrame);
        }

        // Send keepalive every 30 seconds
        const keepalive = setInterval(() => {
          try {
            controller.enqueue(
              new TextEncoder().encode("event: ping\ndata: keepalive\n\n"),
            );
          } catch {
            clearInterval(keepalive);
            this.clients.delete(client);
          }
        }, 30000);

        // Cleanup on close
        req.signal?.addEventListener("abort", () => {
          clearInterval(keepalive);
          this.clients.delete(client);
          logger.info(
            `Stream client disconnected: ${client.id} (${this.clients.size} total)`,
          );
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Handle HTTP request for viewer page
  handleViewerRequest(): Response {
    return new Response(this.getViewerHTML(), {
      headers: { "content-type": "text/html" },
    });
  }

  private sendFrameToClient(client: StreamClient, frameData: Uint8Array) {
    try {
      // Convert binary data to base64 for SSE
      const base64Frame = btoa(String.fromCharCode(...frameData));
      const message = `event: frame\ndata: ${base64Frame}\n\n`;
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      logger.warn(`Failed to send frame to client ${client.id}:`, error);
      this.clients.delete(client);
    }
  }

  broadcastFrame(frameData: Uint8Array) {
    if (this.clients.size === 0) return;

    this.latestFrame = frameData;

    // Send to all connected clients
    for (const client of this.clients) {
      this.sendFrameToClient(client, frameData);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  private getViewerHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>E2E Test Stream</title>
    <style>
        body { margin: 0; padding: 20px; background: #1a1a1a; color: white; font-family: monospace; }
        canvas { border: 1px solid #444; max-width: 100%; }
        #status { margin-bottom: 10px; }
        .connected { color: #4CAF50; }
        .disconnected { color: #f44336; }
    </style>
</head>
<body>
    <div id="status">Connecting...</div>
    <canvas id="stream"></canvas>
    
    <script>
        const canvas = document.getElementById('stream');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        
        const eventSource = new EventSource('/e2e-stream');
        
        eventSource.onopen = () => {
            status.textContent = 'Connected - waiting for stream...';
            status.className = 'connected';
        };
        
        eventSource.onmessage = () => {
            // Default handler for events without explicit type
        };
        
        eventSource.addEventListener('frame', (event) => {
            const base64Data = event.data;
            const binary = atob(base64Data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            
            const blob = new Blob([bytes], { type: 'image/png' });
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                status.textContent = \`Streaming (\${img.width}x\${img.height})\`;
                URL.revokeObjectURL(img.src);
            };
            
            img.src = URL.createObjectURL(blob);
        });
        
        eventSource.addEventListener('ping', () => {
            // Keepalive - no action needed
        });
        
        eventSource.onerror = () => {
            status.textContent = 'Connection error';
            status.className = 'disconnected';
        };
    </script>
</body>
</html>`;
  }
}

// Global server instance
let streamServer: SimpleStreamServer | null = null;

export function getStreamServer(): SimpleStreamServer {
  if (!streamServer) {
    streamServer = new SimpleStreamServer();
  }
  return streamServer;
}

// Route handlers for integration with existing server
export function handleStreamRoutes(req: Request): Response | null {
  const url = new URL(req.url);

  if (url.pathname === "/e2e-stream") {
    return getStreamServer().handleStreamRequest(req);
  }

  if (url.pathname === "/e2e-viewer") {
    return getStreamServer().handleViewerRequest();
  }

  return null; // Not handled by this module
}
