import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointHome__param } from './param_type.ts';
import { Query__EntrypointHome__output_type } from './output_type.ts';
import { EntrypointHome as resolver } from '../../../../isograph/entrypoints/EntrypointHome.ts';
import Query__Home__resolver_reader from '../../Query/Home/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointHome__param> = [
  {
    kind: "Resolver",
    alias: "Home",
    arguments: null,
    readerArtifact: Query__Home__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointHome__param,
  Query__EntrypointHome__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointHome",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
