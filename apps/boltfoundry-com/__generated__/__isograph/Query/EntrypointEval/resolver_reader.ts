import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointEval__param } from './param_type.ts';
import { Query__EntrypointEval__output_type } from './output_type.ts';
import { EntrypointEval as resolver } from '../../../../entrypoints/EntrypointEval.ts';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';
import Query__Eval__resolver_reader from '../../Query/Eval/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointEval__param> = [
  {
    kind: "Resolver",
    alias: "Eval",
    arguments: null,
    readerArtifact: Query__Eval__resolver_reader,
    usedRefetchQueries: [],
  },
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
        fieldName: "__typename",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
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
            ],
          },
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
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointEval__param,
  Query__EntrypointEval__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointEval",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
