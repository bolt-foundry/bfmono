import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointEval__param } from './param_type.ts';
import { Query__EntrypointEval__output_type } from './output_type.ts';
import { EntrypointEval as resolver } from '../../../../entrypoints/EntrypointEval.ts';
import Query__Eval__resolver_reader from '../../Query/Eval/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointEval__param> = [
  {
    kind: "Resolver",
    alias: "Eval",
    arguments: [
      [
        "deckId",
        { kind: "Variable", name: "deckId" },
      ],
    ],
    readerArtifact: Query__Eval__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointEval__param,
  Query__EntrypointEval__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointEval",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
