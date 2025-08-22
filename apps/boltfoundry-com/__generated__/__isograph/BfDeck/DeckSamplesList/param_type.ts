import { type BfSample__SampleListItem__output_type } from '../../BfSample/SampleListItem/output_type.ts';

export type BfDeck__DeckSamplesList__param = {
  readonly data: {
    readonly id: string,
    readonly samples: ({
      readonly edges: (ReadonlyArray<({
        readonly node: ({
          readonly SampleListItem: BfSample__SampleListItem__output_type,
        } | null),
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
