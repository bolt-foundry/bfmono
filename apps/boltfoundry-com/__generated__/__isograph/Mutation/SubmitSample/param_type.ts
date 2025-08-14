import type { Mutation__SubmitSample__parameters } from './parameters_type.ts';

export type Mutation__SubmitSample__param = {
  readonly data: {
    readonly submitSample: ({
      readonly id: string,
      readonly name: (string | null),
      readonly completionData: (string | null),
      readonly collectionMethod: (string | null),
    } | null),
  },
  readonly parameters: Mutation__SubmitSample__parameters,
};
