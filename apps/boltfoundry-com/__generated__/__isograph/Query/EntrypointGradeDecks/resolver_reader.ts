import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointGradeDecks__param } from './param_type.ts';
import { Query__EntrypointGradeDecks__output_type } from './output_type.ts';
import { EntrypointGradeDecks as resolver } from '../../../../entrypoints/EntrypointGradeDecks.ts';
import Query__Grade__resolver_reader from '../../Query/Grade/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointGradeDecks__param> = [
  {
    kind: "Resolver",
    alias: "Grade",
    arguments: null,
    readerArtifact: Query__Grade__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointGradeDecks__param,
  Query__EntrypointGradeDecks__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointGradeDecks",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
