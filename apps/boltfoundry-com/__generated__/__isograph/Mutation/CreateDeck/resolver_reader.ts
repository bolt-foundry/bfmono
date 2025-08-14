import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Mutation__CreateDeck__param } from './param_type.ts';
import { Mutation__CreateDeck__output_type } from './output_type.ts';
import { CreateDeckMutation as resolver } from '../../../../mutations/CreateDeckMutation.tsx';

const readerAst: ReaderAst<Mutation__CreateDeck__param> = [
  {
    kind: "Linked",
    fieldName: "createDeck",
    alias: null,
    arguments: [
      [
        "name",
        { kind: "Variable", name: "name" },
      ],

      [
        "description",
        { kind: "Variable", name: "description" },
      ],

      [
        "content",
        { kind: "Variable", name: "content" },
      ],

      [
        "slug",
        { kind: "Variable", name: "slug" },
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
        fieldName: "description",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Scalar",
        fieldName: "slug",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
      {
        kind: "Scalar",
        fieldName: "content",
        alias: null,
        arguments: null,
        isUpdatable: false,
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Mutation__CreateDeck__param,
  Mutation__CreateDeck__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Mutation.CreateDeck",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
