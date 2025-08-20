import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__DecksList__param } from './param_type.ts';
import { DecksList as resolver } from '../../../../isograph/components/BfOrganization/DecksList.tsx';
import BfDeck__DecksListItem__resolver_reader from '../../BfDeck/DecksListItem/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__DecksList__param> = [
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
  BfOrganization__DecksList__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.DecksList",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
