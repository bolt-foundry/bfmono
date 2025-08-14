import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__SubmitSample__param } from './param_type.ts';
import { Mutation__SubmitSample__output_type } from './output_type.ts';
import { SubmitSampleMutation as resolver } from '../../../../mutations/SubmitSampleMutation.tsx';

const readerAst: ReaderAst<Mutation__SubmitSample__param> = [
  {
    kind: "Linked",
    fieldName: "submitSample",
    alias: null,
    arguments: [
      [
        "deckId",
        { kind: "Variable", name: "deckId" },
      ],

      [
        "completionData",
        { kind: "Variable", name: "completionData" },
      ],

      [
        "collectionMethod",
        { kind: "Variable", name: "collectionMethod" },
      ],

      [
        "name",
        { kind: "Variable", name: "name" },
      ],
    ],
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
        fieldName: "completionData",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Scalar",
        fieldName: "collectionMethod",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Mutation__SubmitSample__param,
  Mutation__SubmitSample__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.SubmitSample",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
