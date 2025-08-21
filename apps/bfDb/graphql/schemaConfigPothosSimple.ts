import SchemaBuilder from "@pothos/core";
import RelayPlugin from "@pothos/plugin-relay";
import type { GraphQLSchema } from "graphql";
import { loadGqlTypesPothos } from "./loadGqlTypesPothos.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { BfGraphqlContext } from "./graphqlContext.ts";
import type {
  BfGraphqlScalars,
  BfSchemaBuilder,
} from "./types/sharedScalars.ts";

const logger = getLogger(import.meta);

/**
 * Simple Pothos schema builder that integrates with our existing builder system
 *
 * This loads all types through the existing defineGqlNode() system,
 * solving the Nexus interface implementation bug.
 */

/**
 * Creates a fresh Pothos schema builder with minimal configuration
 */
function createPothosBuilder(): BfSchemaBuilder {
  const builder = new SchemaBuilder<{
    Context: BfGraphqlContext;
    Scalars: BfGraphqlScalars;
  }>({
    plugins: [RelayPlugin],
    relay: {
      cursorType: "String",
    },
  });

  // Add custom scalars
  builder.scalarType("IsoDate", {
    description: "ISO 8601 date string",
    serialize: (value) => String(value),
    parseValue: (value) => String(value),
  });

  builder.scalarType("JSON", {
    description: "JSON scalar type",
    serialize: (value) => JSON.stringify(value),
    parseValue: (value) => JSON.parse(value as string),
  });

  return builder;
}

/**
 * Create the complete Pothos schema by loading all types from builder system
 */
export async function createPothosSchema(): Promise<GraphQLSchema> {
  logger.debug("Creating simple Pothos GraphQL schema");

  // Create a fresh builder instance for each schema creation
  const builder = createPothosBuilder();

  // Load and convert all types using our builder system
  // This will handle CurrentViewer and all other types automatically
  const allTypes = await loadGqlTypesPothos({ builder });
  logger.debug(`Loaded ${allTypes.types.length} types from builder system`);

  // No need for fallback Query type creation since loadGqlTypesPothos handles it

  // Build and return the schema
  const schema = builder.toSchema();

  logger.debug("Simple Pothos schema created successfully");

  return schema;
}

/**
 * Export builder factory for use in tests and extensions
 */
export { createPothosBuilder as pothosBuilder };
