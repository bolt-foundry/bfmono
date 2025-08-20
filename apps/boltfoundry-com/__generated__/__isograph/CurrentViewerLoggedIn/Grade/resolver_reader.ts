import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { CurrentViewerLoggedIn__Grade__param } from './param_type.ts';
import { Grade as resolver } from '../../../../isograph/components/CurrentViewerLoggedIn/Grade.tsx';
import BfOrganization__DecksList__resolver_reader from '../../BfOrganization/DecksList/resolver_reader.ts';

const readerAst: ReaderAst<CurrentViewerLoggedIn__Grade__param> = [
  {
    kind: "Linked",
    fieldName: "organization",
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
        kind: "Resolver",
        alias: "DecksList",
        arguments: null,
        readerArtifact: BfOrganization__DecksList__resolver_reader,
        usedRefetchQueries: [],
      },
    ],
  },
];

const artifact: ComponentReaderArtifact<
  CurrentViewerLoggedIn__Grade__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "CurrentViewerLoggedIn.Grade",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
