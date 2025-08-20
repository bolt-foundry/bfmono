import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointPg__param } from './param_type.ts';
import { Query__EntrypointPg__output_type } from './output_type.ts';
import { EntrypointPg as resolver } from '../../../../entrypoints/EntrypointPg.ts';

const readerAst: ReaderAst<Query__EntrypointPg__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointPg__param,
  Query__EntrypointPg__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointPg",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
