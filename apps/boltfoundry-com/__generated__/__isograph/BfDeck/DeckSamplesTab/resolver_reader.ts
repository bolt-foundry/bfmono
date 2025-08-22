import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfDeck__DeckSamplesTab__param } from './param_type.ts';
import { DeckSamplesTab as resolver } from '../../../../isograph/components/BfDeck/DeckSamplesTab.tsx';
import BfDeck__DeckSamplesList__resolver_reader from '../../BfDeck/DeckSamplesList/resolver_reader.ts';

const readerAst: ReaderAst<BfDeck__DeckSamplesTab__param> = [
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
    kind: "Resolver",
    alias: "DeckSamplesList",
    arguments: null,
    readerArtifact: BfDeck__DeckSamplesList__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfDeck__DeckSamplesTab__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfDeck.DeckSamplesTab",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
