import { parse } from "@std/csv";
import { parseArgs } from "@std/cli";

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

  try {
    // Read input file
    const fileContent = await Deno.readTextFile(flags.input);

    let stories;

    // Check if input is JSON or CSV
    if (flags.input.endsWith(".json")) {
      // Parse JSON directly
      stories = JSON.parse(fileContent);
    } else {
      // Parse CSV with headers - handle multiline content
      const records = parse(fileContent, {
        skipFirstRow: true,
      });

      // Format stories for the deck
      // CSV columns: id, title, content, url, published_at, scraped_at, source_id, relevance_score
      stories = records.map((record: any) => ({
        title: record[1], // title column
        content: record[2], // content column
        url: record[3], // url column
        published_at: record[4], // published_at column
      }));
    }

    // TODO: In Phase 4, this will be replaced with actual deck execution
    // For now, create a mock response to test the pipeline
    const mockResponse = {
      selected_stories: stories.slice(0, 5).map((story, index) => ({
        title: story.title,
        summary: `Mock summary for story ${index + 1}: ${
          story.title.substring(0, 50)
        }...`,
        url: story.url,
        reasoning: "Mock reasoning - Phase 4 will add real AI curation",
      })),
    };

    // Format output
    const output = JSON.stringify(mockResponse, null, 2);

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
