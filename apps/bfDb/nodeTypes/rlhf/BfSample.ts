import { BfNode, type InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { BfDeck } from "./BfDeck.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

/**
 * Collection method for BfSample - how the sample was collected
 */
export type BfSampleCollectionMethod = "manual" | "telemetry";

/**
 * Completion data that combines the OpenAI ChatCompletion response with the original request parameters
 * This interface is designed to be JSON-serializable for database storage
 */
export interface BfSampleCompletionData {
  // OpenAI ChatCompletion fields
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };

  // Original request parameters
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | Array<string>;
  stream?: boolean;
}

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
            .nonNull.string("completionData")
            .string("collectionMethod")
            .string("name"),
        returns: "BfSample",
        resolve: async (_src, args, ctx) => {
          const cv = ctx.getCurrentViewer();
          const deck = await BfDeck.findX(cv, args.deckId as BfGid);
          const sample = await deck.createSamplesItem({
            telemetryData: JSON.parse(args.completionData),
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
