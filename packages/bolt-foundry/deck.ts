/**
 * Deck class - minimal implementation for testing
 */
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import * as path from "@std/path";
import type { DeckRenderOptions } from "./types.ts";
// For now, we'll use the import that works in BfClient.ts
// The actual ChatCompletionCreateParams type is part of our extended type
import type OpenAI from "@openai/openai";
import type { ChatCompletionCreateParamsWithMetadata } from "./BfClient.ts";

type ChatCompletionCreateParams = OpenAI.Chat.ChatCompletionCreateParams;

// RenderOutput includes our metadata extension
type RenderOutput = ChatCompletionCreateParamsWithMetadata;

// Type for tools that matches OpenAI's ChatCompletionTool
type ChatCompletionTool = ChatCompletionCreateParams["tools"] extends
  Array<infer T> ? T : never;

export class Deck {
  deckId: string;
  markdownContent: string;
  deckPath: string;

  constructor(deckId: string, markdownContent: string, deckPath: string) {
    this.deckId = deckId;
    this.markdownContent = markdownContent;
    this.deckPath = deckPath;
  }

  render(
    options: DeckRenderOptions = {},
    openaiParams?: Partial<ChatCompletionCreateParams>,
  ): RenderOutput {
    // Process markdown includes and collect context definitions
    const { processedContent, contextDefs } = this.processMarkdownIncludes(
      this.markdownContent,
      this.deckPath,
    );

    const messages: Array<
      { role: "system" | "assistant" | "user"; content: string }
    > = [
      {
        role: "system" as const,
        content: processedContent,
      },
    ];

    // Add Q&A pairs for context variables
    const contextVariables = options.context || {};
    for (const [varName, contextDef] of Object.entries(contextDefs)) {
      // Skip tools array when processing contexts
      if (varName === "tools") continue;

      const value = contextVariables[varName];
      if (
        value !== undefined && typeof contextDef === "object" &&
        "assistantQuestion" in contextDef
      ) {
        messages.push(
          {
            role: "assistant" as const,
            content: contextDef.assistantQuestion,
          },
          {
            role: "user" as const,
            content: String(value),
          },
        );
      }
    }

    // Create base output with default messages and tools
    const output: RenderOutput = {
      messages: messages as ChatCompletionCreateParams["messages"],
      tools: contextDefs.tools || [],
      model: "gpt-4o-mini", // Default model
    };

    // Merge OpenAI params if provided (this may override messages)
    if (openaiParams) {
      Object.assign(output, openaiParams);
    }

    // Include metadata unless explicitly disabled
    if (options.captureTelemetry !== false) {
      output.bfMetadata = {
        deckId: this.deckId,
        contextVariables: contextVariables,
        attributes: options.attributes,
      };
    }

    return output;
  }

  processMarkdownIncludes(content: string, basePath: string): {
    processedContent: string;
    contextDefs: Record<string, { assistantQuestion: string }> & {
      tools?: Array<ChatCompletionTool>;
    };
  } {
    let processed = content;
    let hasIncludes = true;
    const contextDefs: Record<string, { assistantQuestion: string }> & {
      tools?: Array<ChatCompletionTool>;
    } = {};

    // Keep processing until no more includes found
    while (hasIncludes) {
      const beforeReplace = processed;
      processed = processed.replace(
        /!\[.*?\]\((.*?)\)/g,
        (_match, filePath) => {
          try {
            // Resolve path relative to the base file's directory using proper path utilities
            const baseDir = path.dirname(basePath);
            const fullPath = path.isAbsolute(filePath)
              ? filePath
              : path.join(baseDir, filePath);
            const fileContent = Deno.readTextFileSync(fullPath);

            // Check if this is a TOML file
            if (filePath.endsWith(".toml")) {
              // Parse TOML and extract context definitions and tools
              const tomlData = this.parseToml(fileContent);
              if (tomlData.contexts) {
                Object.assign(contextDefs, tomlData.contexts);
              }
              if (tomlData.tools) {
                contextDefs.tools = (contextDefs.tools || []).concat(
                  tomlData.tools,
                );
              }
              // Remove TOML reference completely
              return "";
            } else {
              // Regular markdown include - recursively process it with correct base path
              const { processedContent, contextDefs: nestedContext } = this
                .processMarkdownIncludes(
                  fileContent,
                  fullPath,
                );
              // Merge nested context definitions
              Object.assign(contextDefs, nestedContext);
              return processedContent;
            }
          } catch (_error) {
            throw new Error(`File not found: ${filePath}`);
          }
        },
      );
      hasIncludes = processed !== beforeReplace;
    }

    // Clean up extra whitespace from TOML removals while preserving structure
    const cleanedContent = processed
      .replace(/\n\s*\n\s*\n/g, "\n\n"); // Multiple empty lines -> double newlines

    return { processedContent: cleanedContent, contextDefs };
  }

  private parseToml(content: string): {
    contexts: Record<string, { assistantQuestion: string }>;
    tools: Array<ChatCompletionTool>;
  } {
    // Simple TOML parser for [contexts.varName] and [[tools]] sections
    const contexts: Record<string, { assistantQuestion: string }> = {};
    const tools: Array<ChatCompletionTool> = [];

    const lines = content.split("\n");
    let currentContext = "";
    let currentTool: { name?: string; description?: string } | null = null;
    let inToolsArray = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Match [[tools]]
      if (trimmed === "[[tools]]") {
        currentTool = {};
        inToolsArray = true;
        currentContext = "";
        continue;
      }

      // Match [contexts.varName]
      const contextMatch = trimmed.match(/^\[contexts\.(\w+)\]$/);
      if (contextMatch) {
        currentContext = contextMatch[1];
        inToolsArray = false;
        currentTool = null;
        continue;
      }

      // Match [tools.parameters] or other tool sections
      if (trimmed.startsWith("[tools.")) {
        // For now, we'll handle this in a simplified way
        continue;
      }

      // Handle tool properties
      if (inToolsArray && currentTool) {
        const nameMatch = trimmed.match(/^name\s*=\s*"(.+)"$/);
        if (nameMatch) {
          currentTool.name = nameMatch[1];
        }

        const descMatch = trimmed.match(/^description\s*=\s*"(.+)"$/);
        if (descMatch) {
          currentTool.description = descMatch[1];
        }

        // When we encounter a new section or end of tool, add to tools array
        if (
          trimmed.startsWith("[") && !trimmed.startsWith("[tools.") ||
          trimmed === ""
        ) {
          if (currentTool?.name && currentTool?.description) {
            tools.push({
              type: "function",
              function: {
                name: currentTool.name,
                description: currentTool.description,
                parameters: {
                  type: "object",
                  properties: {},
                },
              },
            } as ChatCompletionTool);
          }
          currentTool = null;
          inToolsArray = false;
        }
      }

      // Handle context properties
      if (currentContext && !inToolsArray) {
        const questionMatch = trimmed.match(/^assistantQuestion\s*=\s*"(.+)"$/);
        if (questionMatch) {
          contexts[currentContext] = { assistantQuestion: questionMatch[1] };
        }
      }
    }

    // Add final tool if we were in the middle of parsing one
    if (currentTool?.name && currentTool?.description) {
      tools.push({
        type: "function",
        function: {
          name: currentTool.name,
          description: currentTool.description,
          parameters: {
            type: "object",
            properties: {},
          },
        },
      } as ChatCompletionTool);
    }

    return { contexts, tools };
  }
}

// Default API endpoint
const DEFAULT_API_ENDPOINT = "https://boltfoundry.com/api";

// Cache for deck existence checks
const deckCache = new Set<string>();

// Export for testing purposes
export function clearDeckCache() {
  deckCache.clear();
}

/**
 * Read a local deck file and return a Deck instance
 * @param path Path to the .deck.md file
 * @param options Optional configuration for API integration
 * @returns Promise<Deck> A Deck instance
 */
export async function readLocalDeck(path: string, options?: {
  apiKey?: string;
  apiEndpoint?: string;
}): Promise<Deck> {
  // Read the file content
  const markdownContent = await Deno.readTextFile(path);

  // Extract deckId from filename only (not the full path)
  // e.g., "decks/customer/invoice.deck.md" -> "invoice"
  const filename = path.split("/").pop() || "";
  const deckId = filename.replace(".deck.md", "");

  const deck = new Deck(deckId, markdownContent, path);

  // Get API configuration
  const apiKey = options?.apiKey || getConfigurationVariable("BF_API_KEY");
  const apiEndpoint = options?.apiEndpoint ||
    getConfigurationVariable("BF_API_ENDPOINT") ||
    DEFAULT_API_ENDPOINT;

  // Always ensure the API has the latest deck content from disk
  // Only skip if we've already synced this deck in this session (cached)
  if (apiKey && !deckCache.has(deckId)) {
    try {
      const response = await fetch(`${apiEndpoint}/decks/${deckId}`, {
        headers: { "x-bf-api-key": apiKey },
      });

      // Consume response body even if we're not using it
      await response.text();

      // Process includes to get full deck content
      const { processedContent } = deck.processMarkdownIncludes(
        markdownContent,
        path,
      );

      if (response.status === 404) {
        // Create deck if it doesn't exist
        const createResponse = await fetch(`${apiEndpoint}/decks`, {
          method: "POST",
          headers: {
            "x-bf-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: deckId,
            content: markdownContent,
            processedContent: processedContent, // Full content with embeds resolved
          }),
        });
        // Consume the response body to avoid leaks
        await createResponse.text();
      } else {
        // Update existing deck with latest content from disk
        const updateResponse = await fetch(`${apiEndpoint}/decks/${deckId}`, {
          method: "PUT",
          headers: {
            "x-bf-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: markdownContent,
            processedContent: processedContent, // Full content with embeds resolved
          }),
        });
        // Consume the response body to avoid leaks
        await updateResponse.text();
      }

      deckCache.add(deckId);
    } catch {
      // Don't fail deck loading if API is unavailable
    }
  }

  return deck;
}
