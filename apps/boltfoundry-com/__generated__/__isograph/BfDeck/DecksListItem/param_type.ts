
export type BfDeck__DecksListItem__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly description: (string | null),
    readonly slug: string,
    readonly graders: ({
      readonly edges: (ReadonlyArray<({
        readonly node: ({
          readonly id: string,
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
  },
  readonly parameters: Record<PropertyKey, never>,
};
