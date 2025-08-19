import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__DeckList__param } from './param_type.ts';
import { DeckList as resolver } from '../../../../components/Evals/Decks/DeckList.tsx';
import BfDeck__DecksListItem__resolver_reader from '../../BfDeck/DecksListItem/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__DeckList__param> = [
  {
    kind: "Linked",
    fieldName: "decks",
    alias: null,
    arguments: [
      [
        "first",
        { kind: "Literal", value: 100 },
      ],
    ],
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "edges",
        alias: null,
        arguments: null,
        condition: null,
        isUpdatable: false,
        selections: [
          {
            kind: "Linked",
            fieldName: "node",
            alias: null,
            arguments: null,
            condition: null,
            isUpdatable: false,
            selections: [
              {
                kind: "Resolver",
                alias: "DecksListItem",
                arguments: null,
                readerArtifact: BfDeck__DecksListItem__resolver_reader,
                usedRefetchQueries: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__DeckList__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.DeckList",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
