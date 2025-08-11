import {
  type E2ETestContext,
  setupE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const _logger = getLogger(import.meta);

/**
 * Sets up e2e test for promptgrade-ai with automatic server startup
 */
export async function setupPromptgradeAiTest(): Promise<E2ETestContext> {
  const baseUrl = getConfigurationVariable("BF_E2E_PROMPTGRADE_AI_URL");
  return await setupE2ETest({ baseUrl });
}
