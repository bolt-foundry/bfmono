import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointGrade__param } from './param_type.ts';
import { Query__EntrypointGrade__output_type } from './output_type.ts';
import { EntrypointGrade as resolver } from '../../../../isograph/entrypoints/EntrypointGrade.ts';

const readerAst: ReaderAst<Query__EntrypointGrade__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointGrade__param,
  Query__EntrypointGrade__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointGrade",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
