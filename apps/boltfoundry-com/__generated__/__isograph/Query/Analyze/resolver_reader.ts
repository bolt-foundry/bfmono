import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Analyze__param } from './param_type.ts';
import { Analyze as resolver } from '../../../../components/Analyze.tsx';

const readerAst: ReaderAst<Query__Analyze__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  Query__Analyze__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Analyze",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
