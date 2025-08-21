import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfSample__SampleListItem__param } from './param_type.ts';
import { SampleListItem as resolver } from '../../../../isograph/components/BfSample/SampleListItem.tsx';

const readerAst: ReaderAst<BfSample__SampleListItem__param> = [
  {
    kind: "Scalar",
    fieldName: "id",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Scalar",
    fieldName: "name",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Scalar",
    fieldName: "completionData",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Scalar",
    fieldName: "collectionMethod",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  BfSample__SampleListItem__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfSample.SampleListItem",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
