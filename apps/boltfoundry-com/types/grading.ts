export interface GradingSample {
  id: string;
  timestamp: string;
  duration: number;
  provider: string;
  request: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: {
      model?: string;
      messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
      }>;
    };
  };
  response: {
    status?: number;
    headers?: Record<string, string>;
    body?: {
      id?: string;
      object?: string;
      created?: number;
      model?: string;
      usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      choices: Array<{
        index?: number;
        message: {
          role?: string;
          content: string | Record<string, unknown>; // Can be string or JSON object
        };
      }>;
    };
  };
  graderEvaluations?: Array<{
    graderId: string;
    graderName: string;
    score: number;
    reason: string;
  }>;
  humanGrade?: {
    grades: Array<{
      graderId: string;
      score: -3 | -2 | -1 | 1 | 2 | 3;
      reason: string;
    }>;
    gradedBy: string;
    gradedAt: string;
  };
  bfMetadata: {
    deckName: string;
    deckContent: string;
    contextVariables: Record<string, unknown>;
  };
}

export interface DeckDisplaySchema {
  type: "object" | "array" | "string" | "number";
  properties?: Record<string, DeckDisplaySchema>;
  items?: DeckDisplaySchema;
  displayAs?: "table" | "list" | "json" | "text";
  columns?: Array<string>; // For table display
  label?: string;
}
