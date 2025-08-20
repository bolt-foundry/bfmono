import { type BfDeck__DecksListItem__output_type } from '../../BfDeck/DecksListItem/output_type.ts';

export type BfOrganization__DecksList__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly decks: ({
      readonly edges: (ReadonlyArray<({
        readonly node: ({
          readonly id: string,
          readonly name: (string | null),
          readonly description: (string | null),
          readonly DecksListItem: BfDeck__DecksListItem__output_type,
        } | null),
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
