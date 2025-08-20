import type {NormalizationAst} from '@isograph/react';
const normalizationAst: NormalizationAst = {
  kind: "NormalizationAst",
  selections: [
    {
      kind: "Scalar",
      fieldName: "id",
      arguments: null,
    },
    {
      kind: "Linked",
      fieldName: "currentViewer",
      arguments: null,
      concreteType: null,
      selections: [
        {
          kind: "Scalar",
          fieldName: "__typename",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "id",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "orgBfOid",
          arguments: null,
        },
        {
          kind: "Scalar",
          fieldName: "personBfGid",
          arguments: null,
        },
        {
          kind: "InlineFragment",
          type: "CurrentViewerLoggedIn",
          selections: [
            {
              kind: "Scalar",
              fieldName: "id",
              arguments: null,
            },
            {
              kind: "Scalar",
              fieldName: "__typename",
              arguments: null,
            },
            {
              kind: "Linked",
              fieldName: "organization",
              arguments: null,
              concreteType: "BfOrganization",
              selections: [
                {
                  kind: "Scalar",
                  fieldName: "id",
                  arguments: null,
                },
                {
                  kind: "Linked",
                  fieldName: "decks",
                  arguments: [
                    [
                      "first",
                      { kind: "Literal", value: 100 },
                    ],
                  ],
                  concreteType: "BfOrganizationDecksConnection",
                  selections: [
                    {
                      kind: "Linked",
                      fieldName: "edges",
                      arguments: null,
                      concreteType: "BfOrganizationDecksConnectionEdge",
                      selections: [
                        {
                          kind: "Linked",
                          fieldName: "node",
                          arguments: null,
                          concreteType: "BfDeck",
                          selections: [
                            {
                              kind: "Scalar",
                              fieldName: "id",
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
                              kind: "Linked",
                              fieldName: "samples",
                              arguments: [
                                [
                                  "first",
                                  { kind: "Literal", value: 100 },
                                ],
                              ],
                              concreteType: "BfDeckSamplesConnection",
                              selections: [
                                {
                                  kind: "Linked",
                                  fieldName: "edges",
                                  arguments: null,
                                  concreteType: "BfDeckSamplesConnectionEdge",
                                  selections: [
                                    {
                                      kind: "Linked",
                                      fieldName: "node",
                                      arguments: null,
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
                                },
                              ],
                            },
                            {
                              kind: "Scalar",
                              fieldName: "slug",
                              arguments: null,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: "Scalar",
                  fieldName: "domain",
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
        },
      ],
    },
  ],
};
export default normalizationAst;
