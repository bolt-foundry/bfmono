import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointGradeDecks__param } from './param_type.ts';
import { Query__EntrypointGradeDecks__output_type } from './output_type.ts';
import { EntrypointGradeDecks as resolver } from '../../../../entrypoints/EntrypointGradeDecks.ts';
import CurrentViewer__LoginPage__resolver_reader from '../../CurrentViewer/LoginPage/resolver_reader.ts';
import CurrentViewerLoggedIn__Grade__resolver_reader from '../../CurrentViewerLoggedIn/Grade/resolver_reader.ts';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';
import CurrentViewerLoggedOut__asCurrentViewerLoggedOut__resolver_reader from '../../CurrentViewerLoggedOut/asCurrentViewerLoggedOut/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointGradeDecks__param> = [
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
        kind: "Linked",
        fieldName: "asCurrentViewerLoggedOut",
        alias: null,
        arguments: null,
        condition: CurrentViewerLoggedOut__asCurrentViewerLoggedOut__resolver_reader,
        isUpdatable: false,
        selections: [
          {
            kind: "Resolver",
            alias: "LoginPage",
            arguments: null,
            readerArtifact: CurrentViewer__LoginPage__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
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
            kind: "Resolver",
            alias: "Grade",
            arguments: null,
            readerArtifact: CurrentViewerLoggedIn__Grade__resolver_reader,
            usedRefetchQueries: [],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointGradeDecks__param,
  Query__EntrypointGradeDecks__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointGradeDecks",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
