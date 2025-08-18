import type { Query__Eval__parameters } from './parameters_type.ts';

export type Query__Eval__param = {
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
          readonly decks: ({
            readonly edges: (ReadonlyArray<({
              readonly node: ({
                readonly id: string,
                readonly name: (string | null),
                readonly description: (string | null),
                readonly slug: string,
              } | null),
            } | null)> | null),
          } | null),
        } | null),
      } | null),
    } | null),
    readonly deck: ({
      readonly id: string,
      readonly name: (string | null),
      readonly description: (string | null),
      readonly slug: string,
    } | null),
  },
  readonly parameters: Query__Eval__parameters,
};
