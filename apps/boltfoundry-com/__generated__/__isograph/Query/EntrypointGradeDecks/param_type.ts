import { type CurrentViewer__LoginPage__output_type } from '../../CurrentViewer/LoginPage/output_type.ts';
import { type CurrentViewerLoggedIn__Grade__output_type } from '../../CurrentViewerLoggedIn/Grade/output_type.ts';

export type Query__EntrypointGradeDecks__param = {
  readonly data: {
    readonly currentViewer: ({
      readonly __typename: string,
      /**
A client pointer for the CurrentViewerLoggedOut type.
      */
      readonly asCurrentViewerLoggedOut: ({
        readonly LoginPage: CurrentViewer__LoginPage__output_type,
      } | null),
      /**
A client pointer for the CurrentViewerLoggedIn type.
      */
      readonly asCurrentViewerLoggedIn: ({
        readonly Grade: CurrentViewerLoggedIn__Grade__output_type,
      } | null),
    } | null),
  },
  readonly parameters: Record<PropertyKey, never>,
};
