import { type CurrentViewer__LoginPage__output_type } from '../../CurrentViewer/LoginPage/output_type.ts';

export type Query__EntrypointLogin__param = {
  readonly data: {
    readonly currentViewer: ({
      readonly __typename: string,
      readonly id: (string | null),
      readonly personBfGid: (string | null),
      readonly orgBfOid: (string | null),
      readonly LoginPage: CurrentViewer__LoginPage__output_type,
      /**
A client pointer for the CurrentViewerLoggedIn type.
      */
      readonly asCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly id: string,
          readonly name: (string | null),
          readonly domain: (string | null),
        } | null),
        readonly person: ({
          readonly id: string,
          readonly name: (string | null),
          readonly email: (string | null),
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
