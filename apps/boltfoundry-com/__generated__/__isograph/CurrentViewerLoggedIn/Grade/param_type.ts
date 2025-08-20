
export type CurrentViewerLoggedIn__Grade__param = {
  readonly data: {
    readonly organization: ({
      readonly id: string,
      readonly name: (string | null),
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
  },
  readonly parameters: Record<PropertyKey, never>,
};
