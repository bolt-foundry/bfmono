import { type BfDeck__DeckSamplesList__output_type } from '../../BfDeck/DeckSamplesList/output_type.ts';

export type BfDeck__DeckDetailView__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly description: (string | null),
    readonly DeckSamplesList: BfDeck__DeckSamplesList__output_type,
  },
  readonly parameters: Record<PropertyKey, never>,
};
