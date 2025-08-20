import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointRlhf__param } from './param_type.ts';
import { Query__EntrypointRlhf__output_type } from './output_type.ts';
import { EntrypointRlhf as resolver } from '../../../../isograph/entrypoints/EntrypointRlhf.ts';
import CurrentViewer__LoginPage__resolver_reader from '../../CurrentViewer/LoginPage/resolver_reader.ts';
import CurrentViewer__RlhfHome__resolver_reader from '../../CurrentViewer/RlhfHome/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointRlhf__param> = [
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
        kind: "Resolver",
        alias: "LoginPage",
        arguments: null,
        readerArtifact: CurrentViewer__LoginPage__resolver_reader,
        usedRefetchQueries: [],
      },
      {
        kind: "Resolver",
        alias: "RlhfHome",
        arguments: null,
        readerArtifact: CurrentViewer__RlhfHome__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointRlhf__param,
  Query__EntrypointRlhf__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointRlhf",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
