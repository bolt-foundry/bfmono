import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Grade__param } from './param_type.ts';
import { Grade as resolver } from '../../../../components/Grade.tsx';
import BfOrganization__DecksView__resolver_reader from '../../BfOrganization/DecksView/resolver_reader.ts';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__Grade__param> = [
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
                kind: "Resolver",
                alias: "DecksView",
                arguments: null,
                readerArtifact: BfOrganization__DecksView__resolver_reader,
                usedRefetchQueries: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  Query__Grade__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Grade",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
