
export type CurrentViewer__Decks__param = {
  readonly data: {
    /**
A client pointer for the CurrentViewerLoggedIn type.
    */
    readonly asCurrentViewerLoggedIn: ({
      readonly organization: ({
        readonly decks: ({
          readonly edges: (ReadonlyArray<({
            readonly node: ({
              readonly id: string,
              readonly name: (string | null),
              readonly description: (string | null),
              readonly slug: string,
              readonly content: (string | null),
              readonly graders: ({
                readonly edges: (ReadonlyArray<({
                  readonly node: ({
                    readonly id: string,
                    readonly graderText: (string | null),
                  } | null),
                } | null)> | null),
              } | null),
              readonly samples: ({
                readonly edges: (ReadonlyArray<({
                  readonly node: ({
                    readonly id: string,
                  } | null),
                } | null)> | null),
              } | null),
            } | null),
          } | null)> | null),
        } | null),
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
