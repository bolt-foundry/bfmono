import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointPgMock__param } from './param_type.ts';
import { Query__EntrypointPgMock__output_type } from './output_type.ts';
import { EntrypointPgMock as resolver } from '../../../../isograph/entrypoints/EntrypointPgMock.tsx';

const readerAst: ReaderAst<Query__EntrypointPgMock__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointPgMock__param,
  Query__EntrypointPgMock__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointPgMock",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
