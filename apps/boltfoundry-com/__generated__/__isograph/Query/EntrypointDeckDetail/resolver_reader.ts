import type { EagerReaderArtifact, ReaderAst } from '@isograph/react';
import { Query__EntrypointDeckDetail__param } from './param_type.ts';
import { Query__EntrypointDeckDetail__output_type } from './output_type.ts';
import { EntrypointDeckDetail as resolver } from '../../../../entrypoints/EntrypointDeckDetail.tsx';
import CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader from '../../CurrentViewerLoggedIn/asCurrentViewerLoggedIn/resolver_reader.ts';

const readerAst: ReaderAst<Query__EntrypointDeckDetail__param> = [
  {
    kind: "Linked",
    fieldName: "currentViewer",
    alias: null,
    arguments: null,
    condition: null,
    isUpdatable: false,
    selections: [
      {
        kind: "Linked",
        fieldName: "asCurrentViewerLoggedIn",
        alias: null,
        arguments: null,
        condition: CurrentViewerLoggedIn__asCurrentViewerLoggedIn__resolver_reader,
        isUpdatable: false,
        selections: [
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
                fieldName: "name",
                alias: null,
                arguments: null,
                isUpdatable: false,
              },
            ],
          },
        ],
      },
    ],
  },
];

const artifact: EagerReaderArtifact<
  Query__EntrypointDeckDetail__param,
  Query__EntrypointDeckDetail__output_type
> = {
  kind: "EagerReaderArtifact",
  fieldName: "Query.EntrypointDeckDetail",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
