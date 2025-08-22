import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfDeck__DeckSamplesList__param } from './param_type.ts';
import { DeckSamplesList as resolver } from '../../../../isograph/components/BfDeck/DeckSamplesList.tsx';
import BfSample__SampleListItem__resolver_reader from '../../BfSample/SampleListItem/resolver_reader.ts';

const readerAst: ReaderAst<BfDeck__DeckSamplesList__param> = [
  {
    kind: "Scalar",
    fieldName: "id",
    alias: null,
    arguments: null,
    isUpdatable: false,
  },
  {
    kind: "Linked",
    fieldName: "samples",
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
                alias: "SampleListItem",
                arguments: null,
                readerArtifact: BfSample__SampleListItem__resolver_reader,
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
  BfDeck__DeckSamplesList__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfDeck.DeckSamplesList",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
