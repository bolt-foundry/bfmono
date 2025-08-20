import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { CurrentViewerLoggedIn__Grade__param } from './param_type.ts';
import { Grade as resolver } from '../../../../components/Grade.tsx';

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
        kind: "Linked",
        fieldName: "decks",
        alias: null,
        arguments: [
          [
            "first",
            { kind: "Literal", value: 50 },
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
                    kind: "Scalar",
                    fieldName: "slug",
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
