import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointAnalyze__param } from './param_type.ts';
import { Query__EntrypointAnalyze__output_type } from './output_type.ts';
import { EntrypointAnalyze as resolver } from '../../../../entrypoints/EntrypointAnalyze.ts';
import Query__Analyze__resolver_reader from '../../Query/Analyze/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointAnalyze__param> = [
  {
    kind: "Resolver",
    alias: "Analyze",
    arguments: null,
    readerArtifact: Query__Analyze__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointAnalyze__param,
  Query__EntrypointAnalyze__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointAnalyze",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
