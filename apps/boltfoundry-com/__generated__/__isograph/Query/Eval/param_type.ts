
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
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
