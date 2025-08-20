import { type BfOrganization__DecksList__output_type } from '../../BfOrganization/DecksList/output_type.ts';

export type CurrentViewerLoggedIn__Grade__param = {
  readonly data: {
    readonly organization: ({
      readonly id: string,
      readonly name: (string | null),
      readonly DecksList: BfOrganization__DecksList__output_type,
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
