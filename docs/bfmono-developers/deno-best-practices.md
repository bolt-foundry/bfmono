# Deno Best Practices

## Core Development Principles

### 1. Security-First Development

Deno's permission system is a core feature. Always:

- Request only the permissions your application needs
- Be specific with permission scopes
- Document required permissions in your README

```bash
# Good - specific permissions
deno run --allow-read=./data --allow-net=api.example.com script.ts

# Avoid - overly broad
deno run -A script.ts
```

### 2. TypeScript-First

Deno has native TypeScript support:

- Write `.ts` files directly without compilation
- Use strict type checking in `deno.jsonc`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

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

Dependencies are stored in `deno.jsonc`:

```json
{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0",
    "@std/testing": "jsr:@std/testing@^1.0.0",
    "@oak/oak": "jsr:@oak/oak@^17.0.0",
    "express": "npm:express@^4.18.0",
    "zod": "npm:zod@^3.22.0",
    "@bfmono/": "./packages/"
  }
}
```

### Dependency Best Practices

1. **Prefer JSR packages** - Native Deno packages from jsr.io
2. **Use `deno add`** - Automatically manages imports and versions
3. **Lock dependencies** - Commit `deno.lock` to version control
4. **Cache dependencies** - Use `deno cache` before deployment
5. **Version ranges** - Use `^` for minor updates, exact versions for critical
   deps

```typescript
// After running: deno add jsr:@std/assert
import { assertEquals } from "@std/assert";

// After running: deno add npm:express
import express from "express";
```

## Built-in Tools

### Leverage Deno's Toolchain

```bash
deno fmt         # Format code
deno lint        # Lint code
deno test        # Run tests
deno bench       # Run benchmarks
deno compile     # Create executables
deno doc         # Generate documentation
deno coverage    # Test coverage reports
```

### Task Runner

Define tasks in `deno.jsonc`:

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-net main.ts",
    "test": "deno test --coverage",
    "build": "deno compile --output=app main.ts",
    "preview": "deno run --allow-net --allow-read main.ts"
  }
}
```

## Testing

### Test Organization

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// math.test.ts
import { assertEquals } from "@std/assert";
import { add } from "./math.ts";

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

- Place tests next to source files (`module.ts` → `module.test.ts`)
- Use test steps for related tests
- Mock external dependencies with `@std/testing/mock`
- Use snapshots for complex output validation

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

### Complete `deno.jsonc` Example

```json
{
  "tasks": {
    "dev": "deno run --watch main.ts",
    "test": "deno test --parallel",
    "build": "deno compile main.ts"
  },
  "imports": {
    "@std/": "jsr:@std/",
    "@/": "./src/"
  },
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "lint": {
    "include": ["src/"],
    "exclude": ["src/generated/"],
    "rules": {
      "tags": ["recommended"],
      "include": ["no-console"]
    }
  },
  "fmt": {
    "include": ["src/"],
    "exclude": ["src/generated/"],
    "lineWidth": 80,
    "indentWidth": 2,
    "singleQuote": false,
    "proseWrap": "preserve"
  },
  "test": {
    "include": ["src/**/*.test.ts"],
    "exclude": ["src/generated/"]
  }
}
```

## Environment Variables

### Access Environment Variables

```typescript
// Get with fallback
const apiUrl = Deno.env.get("API_URL") ?? "http://localhost:3000";

// Check existence
if (Deno.env.has("DEBUG")) {
  enableDebugMode();
}

// Load from .env file (development only)
import "@std/dotenv/load";
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
2. **Cache dependencies**: Run `deno cache` in CI/CD
3. **Compile binaries**: Use `deno compile` for standalone executables
4. **Minimal permissions**: Document and use only required permissions
5. **Environment validation**: Check required env vars on startup
6. **Health checks**: Implement health endpoints for monitoring
7. **Graceful shutdown**: Handle SIGTERM/SIGINT properly

### Docker Deployment

```dockerfile
FROM denoland/deno:alpine-2.0.0

WORKDIR /app

# Cache dependencies
COPY deno.jsonc deno.lock ./
RUN deno cache --lock=deno.lock deno.jsonc

# Copy application
COPY . .

# Run with specific permissions
CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"]
```

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
