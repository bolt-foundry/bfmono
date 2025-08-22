# Deno Best Practices

## How Deno Differs from Node.js

### Key Differences

#### 1. Security by Default

- **Deno**: Requires explicit permissions (`--allow-read`, `--allow-write`,
  `--allow-net`, etc.)
- **Node**: No permission system, full system access by default

#### 2. TypeScript Support

- **Deno**: Native TypeScript support, no compilation step needed
- **Node**: Requires TypeScript compiler and build configuration

#### 3. Module System

- **Deno**: ES modules only, uses URLs and import maps
- **Node**: CommonJS and ES modules, uses `node_modules` and `package.json`

#### 4. Package Management

- **Deno**: No `node_modules`, imports directly from URLs or via import maps
- **Node**: `npm`/`yarn`/`pnpm` with `node_modules` directory

#### 5. Standard Library

- **Deno**: Modern standard library at `@std/*` on jsr.io
- **Node**: Older built-in modules, community relies on npm packages

#### 6. Built-in Tools

- **Deno**: Includes formatter, linter, test runner, bundler, benchmarking
- **Node**: Requires separate tools (ESLint, Prettier, Jest, Webpack, etc.)

## Best Practices for Deno Development

### 1. Use Import Maps

Define dependencies in `deno.jsonc`:

```json
{
  "imports": {
    "@std/": "jsr:@std/",
    "@bfmono/": "./packages/"
  }
}
```

### 2. Leverage Built-in Tools

- `deno fmt` - Code formatting
- `deno lint` - Linting
- `deno test` - Testing
- `deno bench` - Benchmarking
- `deno task` - Task running

### 3. Permission Management

Be explicit and minimal with permissions:

```bash
# Good - specific permissions
deno run --allow-read=./data --allow-net=api.example.com script.ts

# Avoid - overly broad
deno run -A script.ts
```

### 4. Use JSR for Dependencies

Prefer JSR packages over npm when available:

```typescript
// Preferred
import { assertEquals } from "@std/assert";

// Works but less ideal
import express from "npm:express";
```

### 5. Type Checking

Use strict type checking in `deno.jsonc`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

### 6. Web Standards APIs

Use web-standard APIs that work in both Deno and browsers:

- `fetch()` instead of node-specific HTTP clients
- `URL` and `URLSearchParams` for URL manipulation
- `crypto.subtle` for cryptography
- `FormData`, `Request`, `Response` for HTTP

### 7. Dependency Management

- Lock dependencies with `deno.lock`
- Use `deno cache` to pre-download dependencies
- Specify versions explicitly in imports

### 8. Testing

Write tests alongside code:

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
```

### 9. Configuration

Centralize configuration in `deno.jsonc`:

```json
{
  "tasks": {
    "dev": "deno run --watch main.ts",
    "test": "deno test",
    "build": "deno compile main.ts"
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  },
  "fmt": {
    "lineWidth": 80,
    "indentWidth": 2
  }
}
```

### 10. npm Compatibility

When using npm packages:

```typescript
// Use npm: specifier
import express from "npm:express@4";

// For types
import type { Request, Response } from "npm:@types/express";
```

## Common Migration Patterns

### From `require()` to `import`

```javascript
// Node.js
const fs = require("fs");
const { readFile } = require("fs/promises");

// Deno
import { readFile } from "@std/fs";
```

### From `process.env` to `Deno.env`

```javascript
// Node.js
const apiKey = process.env.API_KEY;

// Deno
const apiKey = Deno.env.get("API_KEY");
```

### From `__dirname` to `import.meta`

```javascript
// Node.js
const currentDir = __dirname;
const currentFile = __filename;

// Deno
const currentDir = new URL(".", import.meta.url).pathname;
const currentFile = new URL(import.meta.url).pathname;
```

### From callbacks to promises

```javascript
// Node.js callback style
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Deno promise style
const data = await Deno.readTextFile("file.txt");
console.log(data);
```

## Performance Tips

1. **Use streaming APIs** for large files
2. **Cache remote imports** with `deno cache`
3. **Bundle for production** with `deno compile`
4. **Use workers** for CPU-intensive tasks
5. **Leverage HTTP/2** support in `Deno.serve()`

## Security Best Practices

1. **Principle of least privilege** - Only request needed permissions
2. **Validate imports** - Review third-party code before importing
3. **Use lock files** - Ensure dependency integrity
4. **Environment variables** - Use `--allow-env` selectively
5. **Network access** - Restrict to specific domains with
   `--allow-net=domain.com`
