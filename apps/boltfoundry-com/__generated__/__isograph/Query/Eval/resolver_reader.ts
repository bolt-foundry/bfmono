import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Eval__param } from './param_type.ts';
import { Eval as resolver } from '../../../../components/Eval.tsx';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__Eval__param> = [
  {
    kind: "Linked",
    fieldName: "currentViewer",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Scalar",
        fieldName: "id",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Scalar",
        fieldName: "personBfGid",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Scalar",
        fieldName: "orgBfOid",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Linked",
        fieldName: "asCurrentViewerLoggedIn",
        alias: null,
        arguments: null,
        condition: CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader,
        isUpdatable: false,
        selections: [
          {
            kind: "Linked",
            fieldName: "person",
            alias: null,
            arguments: null,
            condition: null,
            isUpdatable: false,
            selections: [
              {
                kind: "Scalar",
                fieldName: "id",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Scalar",
                fieldName: "name",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Scalar",
                fieldName: "email",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
            ],
          },
          {
            kind: "Linked",
            fieldName: "organization",
            alias: null,
            arguments: null,
            condition: null,
            isUpdatable: false,
            selections: [
              {
                kind: "Scalar",
                fieldName: "id",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Scalar",
                fieldName: "name",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Scalar",
                fieldName: "domain",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
              {
                kind: "Linked",
                fieldName: "decks",
                alias: null,
                arguments: [
                  [
                    "first",
                    { kind: "Literal", value: 10 },
                  ],
                ],
                condition: null,
                isUpdatable: false,
                selections: [
                  {
                    kind: "Linked",
                    fieldName: "edges",
                    alias: null,
                    arguments: null,
                    condition: null,
                    isUpdatable: false,
                    selections: [
                      {
                        kind: "Linked",
                        fieldName: "node",
                        alias: null,
                        arguments: null,
                        condition: null,
                        isUpdatable: false,
                        selections: [
                          {
                            kind: "Scalar",
                            fieldName: "id",
                            alias: null,
                            arguments: null,
                            isUpdatable: false,
                          },
                          {
                            kind: "Scalar",
                            fieldName: "name",
                            alias: null,
                            arguments: null,
                            isUpdatable: false,
                          },
                          {
                            kind: "Scalar",
                            fieldName: "description",
                            alias: null,
                            arguments: null,
                            isUpdatable: false,
                          },
                          {
                            kind: "Scalar",
                            fieldName: "slug",
                            alias: null,
                            arguments: null,
                            isUpdatable: false,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  Query__Eval__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Eval",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
