import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

export async function handleDevAuthPopupRequest(
  _request: Request,
): Promise<Response> {
  // Only serve this in development mode
  const bfEnv = getConfigurationVariable("BF_ENV");
  if (bfEnv !== "development" && bfEnv !== "dev") {
    logger.warn("Attempted to access dev auth popup in non-dev environment", {
      bfEnv,
    });
    return new Response("Not found", { status: 404 });
  }

  // Read the HTML file
  const htmlPath = new URL("./devAuthPopup.html", import.meta.url);
  try {
    const html = await Deno.readTextFile(htmlPath);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("Failed to read dev auth popup HTML", error);
    return new Response("Internal server error", { status: 500 });
  }
}
