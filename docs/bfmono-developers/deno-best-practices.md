# Deno Best Practices

## Core Development Principles

### 1. Security-First Development

Deno's permission system is a core feature. Always:

- Request only the permissions your application needs
- Be specific with permission scopes
- Document required permissions in your README
- Use shebangs to embed permissions directly in executable scripts

#### Permission Flags

```bash
# Good - specific permissions
deno run --allow-read=./data --allow-net=api.example.com script.ts

# Avoid - overly broad
deno run -A script.ts
```

#### Shebangs for Direct Execution

Embed permissions directly in your TypeScript files with shebangs:

```typescript
#!/usr/bin/env -S deno run --allow-net --allow-read
// server.ts

import { serve } from "@std/http/server";

serve(() => new Response("Hello World"), { port: 8000 });
```

Benefits of using shebangs:

- **Direct execution**: Run files with `./server.ts` instead of `deno run`
- **Embedded permissions**: Permissions are documented in the file itself
- **Simpler deployment**: Scripts behave like traditional executables
- **Clear requirements**: Anyone can see what permissions are needed

```bash
# Make the file executable
chmod +x server.ts

# Run directly
./server.ts

# Instead of
deno run --allow-net --allow-read server.ts
```

Common shebang patterns:

```typescript
#!/usr/bin/env -S deno run --allow-net --allow-env
// API server with environment variables

#!/usr/bin/env -S deno run --allow-read=. --allow-write=./output
// File processor with limited filesystem access

#!/usr/bin/env -S deno run --allow-run=git,npm
// Build script with subprocess permissions

#!/usr/bin/env -S deno run --unstable-kv --allow-net
// Script using unstable features
```

### 2. TypeScript-First

Deno has native TypeScript support:

- Write `.ts` files directly without compilation
- Use strict type checking
- No build step required
- Type errors caught at runtime or with `bft check`

### 3. Web Standards APIs

Leverage web-standard APIs that work across Deno, browsers, and edge runtimes:

- `fetch()` for HTTP requests
- `URL` and `URLSearchParams` for URL manipulation
- `crypto.subtle` for cryptography
- `FormData`, `Request`, `Response` for HTTP handling
- `ReadableStream` and `WritableStream` for data processing
- `WebSocket` for real-time communication

## Module Management

### Adding Dependencies

Use `deno add` to install and manage dependencies:

```bash
# Add JSR packages (preferred)
deno add jsr:@std/assert
deno add jsr:@std/testing
deno add jsr:@oak/oak

# Add npm packages when needed
deno add npm:express
deno add npm:zod
deno add npm:@types/express --dev
```

The `deno add` command automatically:

- Updates your `deno.jsonc` imports section
- Downloads and caches the package
- Updates the lock file

### Import Maps

See
[Deno's managing dependencies documentation](https://docs.deno.com/runtime/manual/basics/modules/)
for how import maps work in `deno.jsonc`.

### Dependency Best Practices

1. **Prefer JSR packages** - Native Deno packages from jsr.io
2. **Use `deno add`** - Automatically manages imports and versions
3. **Lock dependencies** - Commit `deno.lock` to version control
4. **Version ranges** - Use `^` for minor updates, exact versions for critical
   deps

```typescript
// After running: deno add jsr:@std/assert
import { assertEquals } from "@std/assert";

// After running: deno add npm:express
import express from "express";
```

## Built-in Tools

### BFT Commands (Monorepo Specific)

In the bfmono repository, use `bft` commands instead of direct Deno commands:

```bash
# Use bft commands (preferred in bfmono)
bft format       # Format code with project settings
bft check        # Type check the codebase
bft lint         # Lint with custom rules
bft test         # Run unit tests
bft e2e          # Run end-to-end tests

# Instead of direct Deno commands
deno fmt         # Don't use directly
deno lint        # Don't use directly
deno test        # Don't use directly
```

The `bft` commands:

- Apply project-specific configurations
- Include custom lint rules from `infra/lint/bolt-foundry.ts`
- Handle monorepo workspace structure correctly
- Provide consistent behavior across the team

Always run `bft help` to see available commands and their descriptions.

### General Deno Toolchain

For standalone Deno projects outside this monorepo:

```bash
deno fmt         # Format code
deno lint        # Lint code
deno test        # Run tests
deno bench       # Run benchmarks
deno compile     # Create executables
deno doc         # Generate documentation
deno coverage    # Test coverage reports
```

## Testing

### Test Organization

```typescript
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// src/__tests__/math.test.ts
import { assertEquals } from "@std/assert";
import { add } from "../math.ts";

Deno.test("add function", () => {
  assertEquals(add(2, 3), 5);
});

// Async tests
Deno.test("async operation", async () => {
  const result = await fetchData();
  assertEquals(result.status, "success");
});

// Test groups
Deno.test("Math operations", async (t) => {
  await t.step("addition", () => {
    assertEquals(add(2, 3), 5);
  });

  await t.step("subtraction", () => {
    assertEquals(subtract(5, 3), 2);
  });
});
```

### Testing Patterns

- Place tests in `__tests__` folders within each module directory
- E2E tests go in `__tests__/e2e/` subdirectories
- Use test steps for related tests
- Mock external dependencies with `@std/testing/mock`
- Run tests with `bft test` for unit tests and `bft e2e` for end-to-end tests

## Performance Optimization

### 1. Streaming APIs

Use streams for large data processing:

```typescript
// Good - streaming
const file = await Deno.open("large-file.txt");
const readable = file.readable;

for await (const chunk of readable) {
  processChunk(chunk);
}

// Avoid for large files
const content = await Deno.readTextFile("large-file.txt");
```

### 2. Worker Threads

Offload CPU-intensive tasks:

```typescript
// worker.ts
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// main.ts
const worker = new Worker(
  new URL("./worker.ts", import.meta.url),
  { type: "module" },
);
```

### 3. HTTP/2 Server

Use Deno's built-in HTTP server:

```typescript
Deno.serve({
  port: 8000,
  handler: (req) => {
    return new Response("Hello World");
  },
});
```

## Configuration

### Deno Configuration

See
[Deno's official configuration documentation](https://docs.deno.com/runtime/manual/getting_started/configuration_file)
for complete `deno.jsonc` reference.

**Note:** In the bfmono repository, we don't use Deno's `tasks` field. All tasks
are handled through `bft` commands instead.

## Environment Variables

### Access Environment Variables

In the bfmono repository, we use `sitevar` for managing environment variables.

```typescript
// Get with fallback
const apiUrl = Deno.env.get("API_URL") ?? "http://localhost:3000";

// Check existence
if (Deno.env.has("DEBUG")) {
  enableDebugMode();
}
```

## File System Operations

### Modern File APIs

```typescript
// Read text file
const content = await Deno.readTextFile("config.json");

// Write text file
await Deno.writeTextFile("output.txt", "Hello World");

// Read JSON
const data = JSON.parse(await Deno.readTextFile("data.json"));

// File metadata
const fileInfo = await Deno.stat("file.txt");
console.log(fileInfo.size, fileInfo.isFile);

// Directory operations
for await (const entry of Deno.readDir(".")) {
  console.log(entry.name, entry.isDirectory);
}
```

## Error Handling

### Structured Error Handling

```typescript
// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Error boundaries in async code
try {
  const data = await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof Deno.errors.PermissionDenied) {
    // Handle permission errors
  } else {
    // Handle unexpected errors
    throw error;
  }
}
```

## npm Compatibility

### Using npm Packages

```typescript
// Import npm packages
import express from "npm:express@4";
import { z } from "npm:zod@3";

// Import types
import type { Request, Response } from "npm:@types/express";

// In deno.jsonc for cleaner imports
{
  "imports": {
    "express": "npm:express@4",
    "zod": "npm:zod@3"
  }
}
```

## Deployment

### Production Checklist

1. **Lock dependencies**: Ensure `deno.lock` is committed
2. **Compile binaries**: Use `bft compile` for standalone executables
3. **Minimal permissions**: Document and use only required permissions
4. **Environment validation**: Check required env vars on startup
5. **Health checks**: Implement health endpoints for monitoring
6. **Graceful shutdown**: Handle SIGTERM/SIGINT properly

## Common Patterns

### Singleton Pattern

```typescript
// singleton.ts
let instance: Database | undefined;

export function getDatabase(): Database {
  if (!instance) {
    instance = new Database();
  }
  return instance;
}
```

### Factory Pattern

```typescript
// factory.ts
export function createLogger(level: "debug" | "info" | "error") {
  return {
    log: (message: string) => {
      console.log(`[${level.toUpperCase()}] ${message}`);
    },
  };
}
```

### Module Pattern

```typescript
// api.ts
const BASE_URL = "https://api.example.com";

export async function fetchUser(id: string) {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  return response.json();
}

export async function updateUser(id: string, data: unknown) {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}
```
