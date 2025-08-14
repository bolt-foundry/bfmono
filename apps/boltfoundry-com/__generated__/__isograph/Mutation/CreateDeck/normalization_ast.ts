import type {NormalizationAst} from '@isograph/react';
const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Linked",
      fieldName: "createDeck",
      arguments: [
        [
          "name",
          { kind: "Variable", name: "name" },
        ],

        [
          "description",
          { kind: "Variable", name: "description" },
        ],

        [
          "content",
          { kind: "Variable", name: "content" },
        ],

        [
          "slug",
          { kind: "Variable", name: "slug" },
        ],
      ],
      concreteType: "BfDeck",
      selections: [
        {
          kind: "Scalar",
          fieldName: "id",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "content",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "description",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "name",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "slug",
          arguments: null,
        },
      ],
    },
  ],
};
export default normalizationAst;
