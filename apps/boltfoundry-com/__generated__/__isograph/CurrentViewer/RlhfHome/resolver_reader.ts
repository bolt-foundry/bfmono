import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { CurrentViewer__RlhfHome__param } from './param_type.ts';
import { RlhfHome as resolver } from '../../../../isograph/components/CurrentViewer/RlhfHome.tsx';

const readerAst: ReaderAst<CurrentViewer__RlhfHome__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  CurrentViewer__RlhfHome__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "CurrentViewer.RlhfHome",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
