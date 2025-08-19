import { type BfDeck__DecksListItem__output_type } from '../../BfDeck/DecksListItem/output_type.ts';

export type BfOrganization__DeckList__param = {
  readonly data: {
    readonly decks: ({
      readonly edges: (ReadonlyArray<({
        readonly node: ({
          readonly DecksListItem: BfDeck__DecksListItem__output_type,
        } | null),
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
