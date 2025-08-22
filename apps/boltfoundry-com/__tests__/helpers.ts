import {
  type E2ETestContext,
  setupE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const _logger = getLogger(import.meta);

/**
 * Sets up e2e test for boltfoundry-com with automatic server startup
 */
export async function setupBoltFoundryComTest(options?: {
  titleCard?: {
    title: string;
    subtitle?: string;
    duration?: number;
  };
}): Promise<E2ETestContext> {
  const baseUrl = getConfigurationVariable("BF_E2E_BOLTFOUNDRY_COM_URL");
  const context = await setupE2ETest({ baseUrl });

  // Show title card if requested
  if (options?.titleCard) {
    const { stop, showTitleCard } = await context.startRecording(
      options.titleCard.title.toLowerCase().replace(/\s+/g, "-"),
    );

    await showTitleCard(
      options.titleCard.title,
      options.titleCard.subtitle,
      options.titleCard.duration,
    );

    // Store the recording controls on the context for later use
    // deno-lint-ignore no-explicit-any
    (context as any).__recordingControls = { stop, showTitleCard };
  }

  return context;
}
