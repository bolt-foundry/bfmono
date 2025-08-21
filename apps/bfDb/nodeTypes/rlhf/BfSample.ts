import { BfNode, type InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { BfDeck } from "./BfDeck.ts";
import type { BfGid } from "@bfmono/lib/types.ts";
import type { TelemetryData } from "@bfmono/apps/bfDb/types/telemetry.ts";

/**
 * Collection method for BfSample - how the sample was collected
 */
export type BfSampleCollectionMethod = "manual" | "telemetry";

/**
 * BfSample represents a collected RLHF (Reinforcement Learning from Human Feedback) sample.
 *
 * This node type stores completion data and associated metadata for training and
 * evaluation purposes. Samples can be collected manually by users or automatically
 * via telemetry systems.
 */
export class BfSample extends BfNode<InferProps<typeof BfSample>> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql
      .json("telemetryData")
      .string("collectionMethod")
      .string("name")
      .typedMutation("submitSample", {
        args: (a) =>
          a
            .nonNull.string("deckId")
            .nonNull.string("telemetryDataJson")
            .string("collectionMethod")
            .string("name"),
        returns: "BfSample",
        resolve: async (_src, args, ctx) => {
          const cv = ctx.getCurrentViewer();
          const deck = await BfDeck.findX(cv, args.deckId as BfGid);
          const sample = await deck.createSamplesItem({
            telemetryData: JSON.parse(args.telemetryDataJson),
            collectionMethod: (args.collectionMethod ||
              "manual") as BfSampleCollectionMethod,
            name: args.name || "",
          });

          return sample.toGraphql();
        },
      })
  );

  /**
   * Database field specification for BfSample.
   * Defines the fields that are stored in the database.
   */
  static override bfNodeSpec = this.defineBfNode((node) =>
    node
      .json("telemetryData") // Native JSON storage for full telemetry data
      .string("collectionMethod") // "manual" | "telemetry"
      .string("name") // Optional human-readable name for the sample
  );
}
