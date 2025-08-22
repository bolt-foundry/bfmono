import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfDeck__DeckDetailView__param } from './param_type.ts';
import { DeckDetailView as resolver } from '../../../../isograph/components/BfDeck/DeckDetailView.tsx';
import BfDeck__DeckGradersTab__resolver_reader from '../../BfDeck/DeckGradersTab/resolver_reader.ts';
import BfDeck__DeckInboxTab__resolver_reader from '../../BfDeck/DeckInboxTab/resolver_reader.ts';
import BfDeck__DeckSamplesTab__resolver_reader from '../../BfDeck/DeckSamplesTab/resolver_reader.ts';

const readerAst: ReaderAst<BfDeck__DeckDetailView__param> = [
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
    fieldName: "description",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Resolver",
    alias: "DeckSamplesTab",
    arguments: null,
    readerArtifact: BfDeck__DeckSamplesTab__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "DeckGradersTab",
    arguments: null,
    readerArtifact: BfDeck__DeckGradersTab__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "DeckInboxTab",
    arguments: null,
    readerArtifact: BfDeck__DeckInboxTab__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfDeck__DeckDetailView__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfDeck.DeckDetailView",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
