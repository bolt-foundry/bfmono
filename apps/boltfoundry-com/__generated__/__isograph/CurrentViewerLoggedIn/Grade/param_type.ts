import { type BfDeck__DeckDetailView__output_type } from '../../BfDeck/DeckDetailView/output_type.ts';
import { type BfOrganization__DecksList__output_type } from '../../BfOrganization/DecksList/output_type.ts';

export type CurrentViewerLoggedIn__Grade__param = {
  readonly data: {
    readonly organization: ({
      readonly id: string,
      readonly name: (string | null),
      readonly DecksList: BfOrganization__DecksList__output_type,
      readonly decks: ({
        readonly edges: (ReadonlyArray<({
          readonly node: ({
            readonly id: string,
            readonly DeckDetailView: BfDeck__DeckDetailView__output_type,
          } | null),
        } | null)> | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
