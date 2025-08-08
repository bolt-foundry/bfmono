import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Eval__param } from './param_type.ts';
import { Eval as resolver } from '../../../../components/Eval.tsx';

const readerAst: ReaderAst<Query__Eval__param> = [
];

const artifact: ComponentReaderArtifact<
  Query__Eval__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Eval",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
