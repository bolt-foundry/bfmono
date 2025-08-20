import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointDeckDetailRedirect__param } from './param_type.ts';
import { Query__EntrypointDeckDetailRedirect__output_type } from './output_type.ts';
import { EntrypointDeckDetailRedirect as resolver } from '../../../../entrypoints/EntrypointDeckDetailRedirect.ts';

const readerAst: ReaderAst<Query__EntrypointDeckDetailRedirect__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointDeckDetailRedirect__param,
  Query__EntrypointDeckDetailRedirect__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointDeckDetailRedirect",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
