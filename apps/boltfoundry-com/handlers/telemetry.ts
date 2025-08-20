import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import type { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
// BfSample type import not needed currently
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { generateDeckSlug } from "@bfmono/apps/bfDb/utils/slugUtils.ts";
import type { OpenAI } from "@openai/openai";

const logger = getLogger(import.meta);

interface TelemetryData {
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

export async function handleTelemetryRequest(
  request: Request,
): Promise<Response> {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Authenticate via API key header
    const apiKey = request.headers.get("x-bf-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // For MVP, use simple API key format: "bf+{orgId}"
    if (!apiKey.startsWith("bf+")) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const orgId = apiKey.replace("bf+", "");

    // Create a CurrentViewer for this organization
    const currentViewer = CurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        "telemetry@boltfoundry.com",
        orgId,
      );

    // Parse the telemetry data
    let telemetryData: TelemetryData;
    try {
      telemetryData = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // If no bfMetadata, just acknowledge the telemetry
    if (!telemetryData.bfMetadata) {
      logger.info("Telemetry received without deck metadata");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Telemetry processed without deck metadata",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { deckId } = telemetryData.bfMetadata;
    // contextVariables and attributes not used yet

    // Get the organization node
    const org = await BfOrganization.findX(
      currentViewer,
      currentViewer.orgBfOid,
    );

    // Generate slug for this deck
    const slug = generateDeckSlug(deckId, currentViewer.orgBfOid);

    // Query for existing deck with this slug in the organization
    const existingDecks = await org.queryDecks({ slug });

    let deck: BfDeck;
    if (existingDecks.length > 0) {
      // Found existing deck in this org
      deck = existingDecks[0];
      logger.info(`Found existing deck: ${deckId} (slug: ${slug})`);
    } else {
      // Create new deck using the relationship method to ensure proper edge role
      // This ensures the edge has role="decks" which is required for GraphQL queries
      deck = await org.createDecksItem({
        name: deckId,
        content: "",
        description: `Auto-created from telemetry for ${deckId}`,
        slug,
      }) as BfDeck;
      logger.info(`Created new deck: ${deckId} (slug: ${slug})`);
    }

    // TODO: Add sample creation once deck display is working
    // For now, just acknowledge the telemetry
    logger.info(`Telemetry received for deck ${deck.props.name}`);

    // Force a small delay to ensure SQLite WAL is committed
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new Response(
      JSON.stringify({
        success: true,
        deckId: deck.metadata.bfGid,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error("Error processing telemetry:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
