import { parse } from "@std/csv";
import { parseArgs } from "@std/cli";
import { BfClient } from "@bfmono/packages/bolt-foundry/BfClient.ts";
import OpenAI from "@openai/openai";

/**
 * Fastpitch - AI/tech news curator for engineers
 *
 * Processes technology articles and returns the top 5 most relevant stories
 * for software engineers with summaries and reasoning.
 */

// Help command
export function help() {
  console.log(`
fastpitch - Curate top AI/tech stories for engineers

Commands:
  bft fastpitch generate    Process stories and generate top 5 selection

Usage:
  bft fastpitch generate --input <csv-file> [--output <json-file>]

Options:
  --input <file>   Input CSV file with articles
  --output <file>  Output JSON file (default: stdout)

Example:
  bft fastpitch generate --input shared/fastpitch-data/raw/articles_0.csv
`);
}

// Generate command - process stories through curator deck
export async function generate(args: string[]) {
  const flags = parseArgs(args, {
    string: ["input", "output"],
  });

  if (!flags.input) {
    console.error("Error: --input flag is required");
    console.error("Usage: bft fastpitch generate --input <csv-file>");
    Deno.exit(1);
  }

  if (!flags.input.endsWith(".csv")) {
    console.error("Error: Input file must be a CSV file");
    Deno.exit(1);
  }

  try {
    // Read input CSV file
    const fileContent = await Deno.readTextFile(flags.input);

    // Parse CSV with headers - handle multiline content
    const records = parse(fileContent, {
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

    // Format stories for the deck
    const stories = records.map((record: any) => ({
      title: record.title,
      content: record.content,
      url: record.url,
      published_at: record.published_at,
    }));

    // Initialize BfClient for telemetry
    const client = new BfClient({
      apiKey: Deno.env.get("FASTPITCH_BF_API_KEY") || "bf+fastpitch-test",
    });

    // Configure OpenAI client for OpenRouter with BfClient's fetch
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENROUTER_API_KEY") || "",
      baseURL: Deno.env.get("OPENROUTER_BASE_URL") ||
        "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://boltfoundry.com",
        "X-Title": "Fastpitch",
      },
      fetch: client.fetch, // Use BfClient's fetch for telemetry
    });

    // Check if API key is configured
    if (!Deno.env.get("OPENROUTER_API_KEY")) {
      console.warn("Warning: OPENROUTER_API_KEY not set, using mock response");

      // Mock response for testing without API key
      const mockResponse = {
        selected_stories: stories.slice(0, 5).map((story, index) => ({
          title: story.title,
          summary: `Mock summary for story ${index + 1}: ${
            story.title ? story.title.substring(0, 50) : "No title"
          }...`,
          url: story.url,
          reasoning:
            "Mock reasoning - Set OPENROUTER_API_KEY for real AI curation",
        })),
      };

      const output = JSON.stringify(mockResponse, null, 2);
      if (flags.output) {
        await Deno.writeTextFile(flags.output, output);
        console.log(`✓ Generated output saved to ${flags.output}`);
      } else {
        console.log(output);
      }
      return;
    }

    // Load deck via client
    const deck = await client.readDeckFromPath(
      "infra/bft/tasks/fastpitch/decks/fastpitch-curator.deck.md",
    );

    // Render deck with context
    const request = deck.render({
      context: {
        stories: JSON.stringify(stories), // Pass stories as JSON string
      },
    });

    // Execute via OpenAI client (telemetry tracked automatically)
    const completion = await openai.chat.completions.create(request);

    // Parse the AI response
    let result;
    try {
      let content = completion.choices[0]?.message?.content || "{}";

      // Handle markdown code blocks
      if (content.includes("```json")) {
        content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }

      result = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      result = {
        error: "Failed to parse AI response",
        raw: completion.choices[0]?.message?.content,
      };
    }

    // Format output
    const output = JSON.stringify(result, null, 2);

    // Write to file or stdout
    if (flags.output) {
      await Deno.writeTextFile(flags.output, output);
      console.log(`✓ Generated output saved to ${flags.output}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error(`Error processing stories: ${error.message}`);
    Deno.exit(1);
  }
}

// Main fastpitch function
async function fastpitch(args: string[]): Promise<number> {
  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case "generate":
      await generate(commandArgs);
      return 0;
    case "help":
    case undefined:
      help();
      return 0;
    default:
      console.error(`Unknown command: ${command}`);
      help();
      return 1;
  }
}

// Export the task definition for BFT autodiscovery
export const bftDefinition = {
  description: "Curate top AI/tech stories for engineers",
  fn: fastpitch,
} satisfies import("../bft.ts").TaskDefinition;

// When run directly as a script
if (import.meta.main) {
  const scriptArgs = Deno.args.slice(2); // Skip "run" and script name
  Deno.exit(await fastpitch(scriptArgs));
}
