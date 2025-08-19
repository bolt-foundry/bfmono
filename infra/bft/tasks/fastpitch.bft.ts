import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { parse } from "@std/csv";
import { BfClient } from "@bfmono/packages/bolt-foundry/BfClient.ts";
import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import OpenAI from "@openai/openai";

export function help() {
  ui.info(`
Usage: bft fastpitch <command> [options]

Commands:
  generate  Process stories through the fastpitch-curator deck to get top 5 with summaries

Options:
  --input <file>   CSV file with stories (required)
  --output <file>  Save to file instead of stdout

Example:
  bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv
`);
}

export async function generate(input?: string, output?: string) {
  if (!input) {
    ui.error("Error: --input flag is required");
    ui.info("Usage: bft fastpitch generate --input <csv-file>");
    return;
  }

  // Get API keys from environment
  const bfApiKey = getConfigurationVariable("BF_API_KEY");
  if (!bfApiKey) {
    ui.error("Error: BF_API_KEY environment variable not set");
    ui.info("Set it with: export BF_API_KEY=bf+your-api-key");
    return;
  }

  const openRouterApiKey = getConfigurationVariable("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    ui.error("Error: OPENROUTER_API_KEY environment variable not set");
    ui.info(
      "Set it with: export OPENROUTER_API_KEY=your-openrouter-api-key",
    );
    return;
  }

  // Read and parse CSV file
  let csvContent: string;
  try {
    csvContent = await Deno.readTextFile(input);
  } catch (error) {
    ui.error(
      `Error reading input file: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return;
  }

  const records = parse(csvContent, {
    skipFirstRow: true,
    columns: [
      "id",
      "title",
      "content",
      "url",
      "published_at",
      "scraped_at",
      "source_id",
      "relevance_score",
    ],
  });

  if (records.length === 0) {
    ui.error("No stories found in input file");
    return;
  }

  ui.info(`Processing ${records.length} stories...`);

  // Create BfClient for telemetry
  const bfClient = BfClient.create({ apiKey: bfApiKey });

  // Load the fastpitch-curator deck using instance method
  const deckPath = "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md";
  const deck = await bfClient.readLocalDeck(deckPath);

  // Render the deck with stories as context
  const completion = deck.render({
    context: {
      stories: JSON.stringify(records, null, 2),
    },
    attributes: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Create OpenAI client pointing to OpenRouter with BfClient's fetch for telemetry
  const openai = new OpenAI({
    apiKey: openRouterApiKey,
    baseURL: "https://openrouter.ai/api/v1",
    fetch: bfClient.fetch,
    defaultHeaders: {
      "HTTP-Referer": "https://boltfoundry.com",
      "X-Title": "Bolt Foundry Fastpitch",
    },
  });

  try {
    // Call OpenRouter with telemetry - explicitly not streaming
    const response = await openai.chat.completions.create({
      ...completion,
      stream: false,
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      ui.error("No response from AI");
      return;
    }

    // Output the raw content directly
    if (output) {
      await Deno.writeTextFile(output, content);
      ui.info(`Results saved to ${output}`);
    } else {
      ui.output(content);
    }
  } catch (error) {
    ui.error(
      `Error processing stories: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return;
  }
}

async function fastpitch(args: Array<string>): Promise<number> {
  const command = args[0];

  if (!command || command === "help") {
    help();
    return 0;
  }

  if (command === "generate") {
    // Parse flags
    const flags: Record<string, string> = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith("--")) {
        const key = args[i].substring(2);
        const value = args[i + 1];
        if (value && !value.startsWith("--")) {
          flags[key] = value;
          i++; // Skip the value in next iteration
        }
      }
    }

    await generate(flags.input, flags.output);
  } else {
    ui.error(`Unknown command: ${command}`);
    help();
  }
  return 0;
}

export const bftDefinition = {
  description: "Fastpitch AI news curator for engineering teams",
  fn: fastpitch,
} satisfies TaskDefinition;
