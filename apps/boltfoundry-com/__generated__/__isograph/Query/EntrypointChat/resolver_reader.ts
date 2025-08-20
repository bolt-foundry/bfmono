import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointChat__param } from './param_type.ts';
import { Query__EntrypointChat__output_type } from './output_type.ts';
import { EntrypointChat as resolver } from '../../../../entrypoints/EntrypointChat.ts';
import Query__Chat__resolver_reader from '../../Query/Chat/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointChat__param> = [
  {
    kind: "Resolver",
    alias: "Chat",
    arguments: null,
    readerArtifact: Query__Chat__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointChat__param,
  Query__EntrypointChat__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointChat",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
