
export type Query__Home__param = {
  readonly data: {
    readonly __typename: string,
    readonly githubRepoStats: ({
      readonly stars: number,
    } | null),
    readonly currentViewer: ({
      readonly __typename: string,
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
