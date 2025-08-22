import { type BfDeck__DeckGradersTab__output_type } from '../../BfDeck/DeckGradersTab/output_type.ts';
import { type BfDeck__DeckInboxTab__output_type } from '../../BfDeck/DeckInboxTab/output_type.ts';
import { type BfDeck__DeckSamplesTab__output_type } from '../../BfDeck/DeckSamplesTab/output_type.ts';

export type BfDeck__DeckDetailView__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly description: (string | null),
    readonly DeckSamplesTab: BfDeck__DeckSamplesTab__output_type,
    readonly DeckGradersTab: BfDeck__DeckGradersTab__output_type,
    readonly DeckInboxTab: BfDeck__DeckInboxTab__output_type,
  },
  readonly parameters: Record<PropertyKey, never>,
};
