import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__DecksView__param } from './param_type.ts';
import { DecksView as resolver } from '../../../../components/Evals/Decks/DecksView.tsx';
import BfOrganization__DeckList__resolver_reader from '../../BfOrganization/DeckList/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__DecksView__param> = [
  {
    kind: "Resolver",
    alias: "DeckList",
    arguments: null,
    readerArtifact: BfOrganization__DeckList__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__DecksView__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.DecksView",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
