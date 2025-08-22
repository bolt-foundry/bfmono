import type { OpenAI } from "@openai/openai";

/**
 * Telemetry data structure sent from BfClient to the telemetry endpoint
 * Contains both the original request and the response from the AI provider
 */
export interface TelemetryData {
  duration: number;
  provider: string;
  model?: string;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: OpenAI.Chat.ChatCompletionCreateParams;
    timestamp?: string;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: OpenAI.Chat.ChatCompletion;
    timestamp?: string;
  };
  bfMetadata?: {
    deckId: string;
    contextVariables: Record<string, unknown>;
    attributes?: Record<string, unknown>;
  };
}
