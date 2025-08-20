import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { CurrentViewer__LoginPage__param } from './param_type.ts';
import { LoginPage as resolver } from '../../../../isograph/components/CurrentViewer/LoginPage.tsx';

const readerAst: ReaderAst<CurrentViewer__LoginPage__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  CurrentViewer__LoginPage__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "CurrentViewer.LoginPage",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
