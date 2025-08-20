import { DatabaseSync } from "sqlite";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";

const usage = `
Usage: bft bfdb --query "SELECT * FROM nodes LIMIT 10"
       bft bfdb -q "SELECT COUNT(*) FROM nodes"

Options:
  --query, -q  SQL query to execute
`;

function bfdb(args: Array<string>): number {
  // Parse arguments
  let query: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--query" || args[i] === "-q") {
      query = args[i + 1];
      i++;
    }
  }

  if (!query) {
    ui.error("Error: --query or -q argument is required");
    ui.output(usage);
    return 1;
  }

  // Get database path (same logic as BfDb)
  const customDbPath = getConfigurationVariable("SQLITE_DB_PATH");
  const dbPath = customDbPath || "tmp/bfdb.sqlite";

  try {
    // Open database in read-only mode for safety
    const db = new DatabaseSync(dbPath, {
      readOnly: true,
    });

    // Execute query
    const rows = db.prepare(query).all();

    // Pretty print results
    if (rows.length > 0) {
      // deno-lint-ignore no-console
      console.table(rows);
    } else {
      ui.output("No results found");
    }

    db.close();
  } catch (error) {
    ui.error(
      `Database query failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }

  return 0;
}

// Export the task definition for autodiscovery
export const bftDefinition = {
  description: "Query BfDb SQLite database directly",
  fn: bfdb,
} satisfies TaskDefinition;
