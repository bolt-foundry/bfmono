import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { Query__Chat__param } from './param_type.ts';
import { Chat as resolver } from '../../../../components/Chat.tsx';

const readerAst: ReaderAst<Query__Chat__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
];

const artifact: ComponentReaderArtifact<
  Query__Chat__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "Query.Chat",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
