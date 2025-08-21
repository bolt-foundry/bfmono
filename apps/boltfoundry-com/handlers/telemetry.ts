import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { generateDeckSlug } from "@bfmono/apps/bfDb/utils/slugUtils.ts";
import type { BfGid } from "@bfmono/lib/types.ts";
import type { TelemetryData } from "@bfmono/apps/bfDb/types/telemetry.ts";

const logger = getLogger(import.meta);

export async function handleTelemetryRequest(
  request: Request,
): Promise<Response> {
  logger.info("Telemetry request received");

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

    const orgSlug = apiKey.replace("bf+", "");
    logger.info(`Processing telemetry for org slug: ${orgSlug}`);

    // Create a proper org BfGid from the slug
    // Use "dev-org:" prefix to match the dev authentication
    const orgBfGid = `dev-org:${orgSlug}` as BfGid;
    const personBfGid = `dev-person:${orgSlug}` as BfGid;

    // Create a CurrentViewer for this organization
    const currentViewer = CurrentViewer
      .__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
        import.meta,
        personBfGid,
        orgBfGid,
      );
    logger.info(`CurrentViewer created with orgBfGid: ${orgBfGid}`);

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
    logger.info(`Creating/finding deck: ${deckId}`);

    // Get or create the organization node
    logger.info(`Finding organization with BfGid: ${orgBfGid}`);
    let org = await BfOrganization.find(currentViewer, orgBfGid);

    if (!org) {
      logger.info(`Organization not found, creating new org: ${orgBfGid}`);
      org = await BfOrganization.__DANGEROUS__createUnattached(currentViewer, {
        name: `Telemetry Org ${orgSlug}`,
        domain: orgSlug,
      });
      logger.info(`Organization created: ${org.metadata.bfGid}`);
    } else {
      logger.info("Organization found");
    }

    // Generate slug and query for existing deck by slug to avoid duplicates
    const slug = generateDeckSlug(deckId, org.metadata.bfGid);

    // Use the new queryDecks method to find existing decks
    const existingDecks = await org.queryDecks({
      slug, // Match by slug
    });

    let deck: Awaited<ReturnType<typeof org.createDecksItem>>;
    if (existingDecks.length > 0) {
      // Found existing deck, use it
      deck = existingDecks[0];
      logger.info(`Found existing deck: ${deckId} (slug: ${slug})`);
    } else {
      // Create new deck using the new createDecksItem method
      deck = await org.createDecksItem({
        name: deckId,
        content: "",
        description: `Auto-created from telemetry for ${deckId}`,
        slug,
      });
      logger.info(`Created new deck: ${deckId} (slug: ${slug})`);
    }

    // Record the sample using the deck's recordSample method
    const sample = await deck.recordSample(telemetryData);

    logger.info(`Created sample: ${sample.metadata.bfGid}`);

    return new Response(
      JSON.stringify({
        success: true,
        deckId: deck.metadata.bfGid,
        sampleId: sample.metadata.bfGid,
        message: "Sample created successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error("Error processing telemetry:", error);
    logger.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
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
