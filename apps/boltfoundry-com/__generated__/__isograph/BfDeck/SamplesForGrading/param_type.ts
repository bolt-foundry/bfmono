
export type BfDeck__SamplesForGrading__param = {
  readonly data: {
    readonly id: string,
    readonly name: (string | null),
    readonly content: (string | null),
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
