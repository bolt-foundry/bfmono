import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfDeck__DeckInboxTab__param } from './param_type.ts';
import { DeckInboxTab as resolver } from '../../../../isograph/components/BfDeck/DeckInboxTab.tsx';

const readerAst: ReaderAst<BfDeck__DeckInboxTab__param> = [
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
];

const artifact: ComponentReaderArtifact<
  BfDeck__DeckInboxTab__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfDeck.DeckInboxTab",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
