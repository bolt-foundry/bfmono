import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Home__param } from './param_type.ts';
import { Home as resolver } from '../../../../components/Home.tsx';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__Home__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Linked",
    fieldName: "githubRepoStats",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Scalar",
        fieldName: "stars",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
    ],
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

const artifact: ComponentReaderArtifact<
  Query__Home__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Home",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
