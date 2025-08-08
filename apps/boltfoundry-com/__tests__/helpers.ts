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
export async function setupBoltFoundryComTest(): Promise<E2ETestContext> {
  const baseUrl = getConfigurationVariable("BF_E2E_BOLTFOUNDRY_COM_URL");
  return await setupE2ETest({ baseUrl });
}
