import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfDeck__DeckGradersTab__param } from './param_type.ts';
import { DeckGradersTab as resolver } from '../../../../isograph/components/BfDeck/DeckGradersTab.tsx';

const readerAst: ReaderAst<BfDeck__DeckGradersTab__param> = [
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
  BfDeck__DeckGradersTab__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfDeck.DeckGradersTab",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
