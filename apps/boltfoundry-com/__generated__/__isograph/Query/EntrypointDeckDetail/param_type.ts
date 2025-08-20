
export type Query__EntrypointDeckDetail__param = {
  readonly data: {
    readonly currentViewer: ({
      /**
A client pointer for the CurrentViewerLoggedIn type.
      */
      readonly asCurrentViewerLoggedIn: ({
        readonly organization: ({
          readonly name: (string | null),
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
