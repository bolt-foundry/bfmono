# BFT HyperDX Command Implementation Memo

**Date**: 2025-08-02\
**Status**: Planning\
**Priority**: Low (not time-sensitive)

## Overview

This memo outlines the implementation plan for adding a `bft hyperdx` command to
enable command-line access to HyperDX logs and metrics for production debugging.

## Motivation

- Enable quick production debugging without leaving the terminal
- Enable Claude Code to debug production code using HyperDX
- Integrate observability into existing BFT workflow
- Provide scriptable access to logs and metrics
- Faster than web UI for specific queries and automated analysis

## Technical Requirements

### 1. HyperDX API Integration

**Endpoint**: `POST /api/v1/chart/series`

**Key Features**:

- Query logs and metrics data
- Support for multiple series (max 5)
- Flexible aggregation functions
- Time-based filtering
- Grouping capabilities

**Authentication**: Bearer token in Authorization header

### 2. Configuration

```typescript
// Environment variables
HYPERDX_API_KEY=<api-key>
HYPERDX_API_URL=https://api.hyperdx.io  // Optional, for self-hosted

// TODO: Verify if getConfigurationVar is the current pattern
import { getConfigurationVar } from "@bfmono/packages/get-configuration-var/mod.ts";
```

### 3. Command Structure

```bash
# Log queries
bft hyperdx logs --service=boltFoundry --level=error --last=1h
bft hyperdx logs --search="timeout" --from="2h ago" --to="now"

# Live tail
bft hyperdx tail --service=bfDb --filter="status:500"

# Metrics queries
bft hyperdx metrics --metric=response_time --agg=p95 --group-by=service
bft hyperdx metrics --metric=error_rate --service=boltFoundry --last=24h

# General search
bft hyperdx search "database connection" --last=1h --format=json
```

### 4. Implementation Structure

Create `infra/bft/tasks/hyperdx.bft.ts`:

```typescript
import { TaskDefinition } from "@bfmono/infra/bft/bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getConfigurationVar } from "@bfmono/packages/get-configuration-var/mod.ts";
import { parseArgs } from "@std/cli/parse-args";

interface HyperDXConfig {
  apiKey: string;
  apiUrl: string;
}

interface ChartQueryParams {
  startTime: number;
  endTime: number;
  series: Array<{
    dataSource: "metrics" | "events";
    aggFn?: string;
    field?: string;
    where?: string;
    groupBy?: string[];
  }>;
  granularity?: string;
}

async function queryHyperDX(params: ChartQueryParams, config: HyperDXConfig) {
  const response = await fetch(`${config.apiUrl}/api/v1/chart/series`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HyperDX API error: ${response.statusText}`);
  }

  return response.json();
}

// Subcommand handlers
async function handleLogs(args: string[]): Promise<number> {
  // Implementation
}

async function handleTail(args: string[]): Promise<number> {
  // Implementation with polling
}

async function handleMetrics(args: string[]): Promise<number> {
  // Implementation
}

async function handleSearch(args: string[]): Promise<number> {
  // Implementation
}

export async function hyperdxCommand(args: string[]): Promise<number> {
  if (args.length === 0) {
    ui.output("Usage: bft hyperdx <command> [options]");
    ui.output("\nCommands:");
    ui.output("  logs     Query logs");
    ui.output("  tail     Live tail logs");
    ui.output("  metrics  Query metrics");
    ui.output("  search   Full-text search");
    return 0;
  }

  const subcommand = args[0];
  const subArgs = args.slice(1);

  switch (subcommand) {
    case "logs":
      return await handleLogs(subArgs);
    case "tail":
      return await handleTail(subArgs);
    case "metrics":
      return await handleMetrics(subArgs);
    case "search":
      return await handleSearch(subArgs);
    default:
      ui.error(`Unknown command: ${subcommand}`);
      return 1;
  }
}

export const bftDefinition = {
  description: "Query HyperDX logs and metrics for production debugging",
  fn: hyperdxCommand,
} satisfies TaskDefinition;
```

## Key Features to Implement

### 1. Time Parsing

- Support relative times: "1h ago", "yesterday", "last week"
- Absolute times: ISO 8601 format
- Time ranges: --from and --to flags

### 2. Output Formatting

- **Table**: Default human-readable format
- **JSON**: For scripting and piping
- **Raw**: Plain log output
- **CSV**: For data analysis

### 3. Live Tail Mode

- Poll API every 2-5 seconds
- Show new logs as they arrive
- Support Ctrl+C graceful exit
- Optional highlighting of matched terms

### 4. Smart Filtering

- Service name filtering
- Log level filtering
- Property-based filtering (e.g., "status:500")
- Full-text search with highlighting

### 5. Aggregation Support

- Count, sum, avg, min, max
- Percentiles (p50, p95, p99)
- Group by service, endpoint, etc.
- Time bucketing (1m, 5m, 1h, etc.)

## Example Use Cases

```bash
# Debug recent errors in production
bft hyperdx logs --service=boltFoundry --level=error --last=1h

# Monitor live API errors
bft hyperdx tail --filter="status:5*" --service=bfDb

# Analyze response time trends
bft hyperdx metrics --metric=response_time --agg=p95 --group-by=endpoint --last=24h

# Search for specific error patterns
bft hyperdx search "timeout" --service=boltFoundry --last=6h --format=json | jq '.results[]'

# Export logs for analysis
bft hyperdx logs --from="2025-08-01" --to="2025-08-02" --format=csv > logs.csv
```

## Benefits

1. **Developer Efficiency**: No context switching to web UI
2. **Automation**: Scriptable log analysis and alerting
3. **Integration**: Works with existing Unix tools (grep, jq, etc.)
4. **Performance**: Faster for specific queries than loading web UI
5. **Workflow**: Fits naturally into existing BFT command patterns

## Implementation Timeline

Since this is not time-sensitive:

1. **Phase 1**: Basic log querying (logs command)
2. **Phase 2**: Live tail functionality
3. **Phase 3**: Metrics querying
4. **Phase 4**: Advanced features (formatting, aggregations)

## Open Questions

1. Should we support saving common queries as aliases?
2. Integration with existing logging package?

## Next Steps

When ready to implement:

1. Get HyperDX API key for testing
2. Create `hyperdx.bft.ts` with basic structure
3. Implement logs command first
4. Add tests and documentation
5. Iterate based on team feedback
