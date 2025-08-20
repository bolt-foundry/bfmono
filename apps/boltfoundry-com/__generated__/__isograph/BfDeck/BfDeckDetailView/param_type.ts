
export type BfDeck__BfDeckDetailView__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly description: (string | null),
    readonly samples: ({
      readonly edges: (ReadonlyArray<({
        readonly node: ({
          readonly id: string,
          readonly name: (string | null),
          readonly completionData: (string | null),
          readonly collectionMethod: (string | null),
        } | null),
      } | null)> | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
