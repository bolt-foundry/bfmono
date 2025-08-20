import { type BfOrganization__DecksView__output_type } from '../../BfOrganization/DecksView/output_type.ts';

export type Query__Grade__param = {
  readonly data: {
    readonly currentViewer: ({
      readonly id: (string | null),
      readonly personBfGid: (string | null),
      readonly orgBfOid: (string | null),
      /**
A client pointer for the CurrentViewerLoggedIn type.
      */
      readonly asCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly id: string,
          readonly name: (string | null),
          readonly domain: (string | null),
          readonly DecksView: BfOrganization__DecksView__output_type,
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
