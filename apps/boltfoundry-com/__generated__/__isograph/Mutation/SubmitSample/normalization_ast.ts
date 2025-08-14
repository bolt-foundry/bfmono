import type {NormalizationAst} from '@isograph/react';
const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "submitSample",
      arguments: [
        [
          "deckId",
          { kind: "Variable", name: "deckId" },
        ],

        [
          "completionData",
          { kind: "Variable", name: "completionData" },
        ],

        [
          "collectionMethod",
          { kind: "Variable", name: "collectionMethod" },
        ],

        [
          "name",
          { kind: "Variable", name: "name" },
        ],
      ],
      concreteType: "BfSample",
      selections: [
        {
          kind: "Scalar",
          fieldName: "id",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "collectionMethod",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "completionData",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "name",
          arguments: null,
        },
      ],
    },
  ],
};
export default normalizationAst;
