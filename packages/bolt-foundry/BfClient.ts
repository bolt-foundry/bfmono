import type OpenAI from "@openai/openai";

type ChatCompletion = OpenAI.Chat.ChatCompletion;
type ChatCompletionCreateParams = OpenAI.Chat.ChatCompletionCreateParams;
import type { BfMetadata } from "./types.ts";
import { readLocalDeck } from "./deck.ts";
import type { Deck } from "./deck.ts";

// Type for requests that include our metadata
export type ChatCompletionCreateParamsWithMetadata =
  & ChatCompletionCreateParams
  & {
    bfMetadata?: BfMetadata;
  };

// Default telemetry endpoint
const DEFAULT_TELEMETRY_ENDPOINT = "https://boltfoundry.com/api/telemetry";

// BfClient provides telemetry capture via custom fetch
interface BfClientConfig {
  apiKey: string; // Standard BF API key (bf+{posthogApiKey} format is deprecated)
  collectorEndpoint?: string;
}

export class BfClient {
  public readonly fetch: typeof fetch;
  private readonly apiKey: string;
  private readonly telemetryEndpoint: string;

  constructor(config: BfClientConfig) {
    this.apiKey = config.apiKey;
    this.telemetryEndpoint = config.collectorEndpoint ||
      DEFAULT_TELEMETRY_ENDPOINT;

    // Create wrapped fetch that captures telemetry
    this.fetch = this.createWrappedFetch();
  }

  static create(config: BfClientConfig): BfClient {
    return new BfClient(config);
  }

  /**
   * Read a local deck file - alias for the standalone readLocalDeck function
   * @param path Path to the .deck.md file
   * @param options Optional configuration for API integration
   * @returns Promise<Deck> A Deck instance
   */
  static readLocalDeck(path: string, options?: {
    apiKey?: string;
    apiEndpoint?: string;
  }): Promise<Deck> {
    return readLocalDeck(path, options);
  }

  /**
   * Read a local deck file - instance method alias
   * @param path Path to the .deck.md file
   * @returns Promise<Deck> A Deck instance
   */
  readLocalDeck(path: string): Promise<Deck> {
    return readLocalDeck(path, {
      apiKey: this.apiKey,
    });
  }

  /**
   * Read a deck from file path - alias for readLocalDeck for consistency
   * @param path Path to the .deck.md file
   * @returns Promise<Deck> A Deck instance
   */
  readDeckFromPath(path: string): Promise<Deck> {
    return this.readLocalDeck(path);
  }

  private createWrappedFetch(): typeof fetch {
    const wrappedFetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const requestTimestamp = new Date().toISOString();

      // Capture request body before making the request
      let requestBody: ChatCompletionCreateParams | undefined;
      let isStreamingRequest = false;

      let bfMetadata: BfMetadata | undefined;

      if (init?.body && typeof init.body === "string") {
        try {
          const parsedBody = JSON.parse(init.body);
          // Extract bfMetadata if present
          if (parsedBody && typeof parsedBody === "object") {
            const { bfMetadata: metadata, ...cleanBody } =
              parsedBody as ChatCompletionCreateParamsWithMetadata;
            requestBody = cleanBody;
            bfMetadata = metadata;

            // Check if it's a streaming request
            if ("stream" in cleanBody) {
              isStreamingRequest = cleanBody.stream === true;
            }

            // Update the request to remove bfMetadata
            init = {
              ...init,
              body: JSON.stringify(cleanBody),
            };
          }
        } catch {
          // Keep requestBody as undefined on parse error
        }
      }

      // Start the actual request immediately (don't await)
      const responsePromise = fetch(input, init);

      // Handle telemetry asynchronously if not streaming
      if (requestBody && !isStreamingRequest) {
        // Set up telemetry recording that will run when response is ready
        responsePromise.then((response) => {
          const responseTimestamp = new Date().toISOString();

          // Fire and forget - run telemetry in background
          this.recordTelemetry({
            url,
            requestBody,
            bfMetadata,
            requestTimestamp,
            response: response.clone(), // Clone so we don't interfere with the original
            responseTimestamp,
            headers: init?.headers,
            method: init?.method,
          }).catch(() => {
            // Telemetry recording failed silently
          });
        }).catch(() => {
          // Ignore fetch errors for telemetry purposes
        });
      }

      // Return the promise immediately
      return responsePromise;
    };

    // Set the name property to make it look like a real fetch function
    Object.defineProperty(wrappedFetch, "name", {
      value: "fetch",
      configurable: true,
    });

    return wrappedFetch;
  }

  private async recordTelemetry(data: {
    url: string;
    requestBody: ChatCompletionCreateParams;
    bfMetadata?: BfMetadata;
    requestTimestamp: string;
    response: Response;
    responseTimestamp: string;
    headers?: HeadersInit;
    method?: string;
  }) {
    try {
      // Read response body
      const responseBody = await data.response.json() as ChatCompletion;

      // Extract model and provider
      const model = data.requestBody.model || "unknown";
      const provider = model.includes("/")
        ? model.split("/")[0]
        : this.extractProvider(data.url);

      const duration = new Date(data.responseTimestamp).getTime() -
        new Date(data.requestTimestamp).getTime();

      // Send telemetry data
      await fetch(this.telemetryEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bf-api-key": this.apiKey,
        },
        body: JSON.stringify({
          duration,
          provider,
          model,
          request: {
            url: data.url,
            method: data.method || "POST",
            headers: data.headers as Record<string, string> || {},
            body: data.requestBody,
            timestamp: data.requestTimestamp,
          },
          response: {
            status: data.response.status,
            headers: Object.fromEntries(data.response.headers.entries()),
            body: responseBody,
            timestamp: data.responseTimestamp,
          },
          bfMetadata: data.bfMetadata,
        }),
      });
    } catch {
      // Silently ignore telemetry errors
    }
  }

  private extractProvider(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      // Extract middle part of domain: api.openai.com -> openai
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        // Get the part before the TLD (com, ai, etc)
        return parts[parts.length - 2];
      }
      return hostname;
    } catch {
      return "unknown";
    }
  }
}

// Re-export for convenience
export { readLocalDeck } from "./deck.ts";
export type { Deck } from "./deck.ts";
