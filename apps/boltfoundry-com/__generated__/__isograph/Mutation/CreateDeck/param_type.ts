import type { Mutation__CreateDeck__parameters } from './parameters_type.ts';

export type Mutation__CreateDeck__param = {
  readonly data: {
    readonly createDeck: ({
      readonly id: string,
      readonly name: (string | null),
      readonly description: (string | null),
      readonly slug: string,
      readonly content: (string | null),
    } | null),
  },
  readonly parameters: Mutation__CreateDeck__parameters,
};
