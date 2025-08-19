// deno-lint-ignore-file no-console no-external-import
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { parse } from "jsr:@std/csv@^1.0.6";
import { BfClient } from "@bfmono/packages/bolt-foundry/BfClient.ts";
import type { TaskDefinition } from "../bft.ts";
import OpenAI from "@openai/openai";

export function help() {
  console.log(`
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
    console.error("Error: --input flag is required");
    console.log("Usage: bft fastpitch generate --input <csv-file>");
    return;
  }

  // Get API keys from environment
  const bfApiKey = getConfigurationVariable("BF_API_KEY");
  if (!bfApiKey) {
    console.error("Error: BF_API_KEY environment variable not set");
    console.log("Set it with: export BF_API_KEY=bf+your-api-key");
    return;
  }

  const openRouterApiKey = getConfigurationVariable("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.error("Error: OPENROUTER_API_KEY environment variable not set");
    console.log(
      "Set it with: export OPENROUTER_API_KEY=your-openrouter-api-key",
    );
    return;
  }

  // Read and parse CSV file
  let csvContent: string;
  try {
    csvContent = await Deno.readTextFile(input);
  } catch (error) {
    console.error(
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
    console.error("No stories found in input file");
    return;
  }

  console.log(`Processing ${records.length} stories...`);

  // Load the fastpitch-curator deck
  const deckPath = "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md";
  const deck = await BfClient.readLocalDeck(deckPath, { apiKey: bfApiKey });

  // Render the deck with stories as context
  const completion = deck.render({
    context: {
      stories: JSON.stringify(records, null, 2),
    },
    attributes: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Create BfClient for telemetry
  const bfClient = BfClient.create({ apiKey: bfApiKey });

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
      console.error("No response from AI");
      return;
    }

    // Try to parse as JSON if it looks like JSON
    let result;
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr);
    } catch {
      // If not JSON, create a structured response
      result = {
        date: new Date().toISOString().split("T")[0],
        raw_response: content,
      };
    }

    // Output the result
    const outputJson = JSON.stringify(result, null, 2);

    if (output) {
      await Deno.writeTextFile(output, outputJson);
      console.log(`Results saved to ${output}`);
    } else {
      console.log(outputJson);
    }
  } catch (error) {
    console.error(
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
    console.error(`Unknown command: ${command}`);
    help();
  }
  return 0;
}

export const bftDefinition = {
  description: "Fastpitch AI news curator for engineering teams",
  fn: fastpitch,
} satisfies TaskDefinition;
