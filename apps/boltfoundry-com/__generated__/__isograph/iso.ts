import type { IsographEntrypoint } from '@isograph/react';
import { type BfDeck__DeckDetailView__param } from './BfDeck/DeckDetailView/param_type.ts';
import { type BfDeck__DeckGradersTab__param } from './BfDeck/DeckGradersTab/param_type.ts';
import { type BfDeck__DeckInboxTab__param } from './BfDeck/DeckInboxTab/param_type.ts';
import { type BfDeck__DeckSamplesList__param } from './BfDeck/DeckSamplesList/param_type.ts';
import { type BfDeck__DeckSamplesTab__param } from './BfDeck/DeckSamplesTab/param_type.ts';
import { type BfDeck__DeckSamples__param } from './BfDeck/DeckSamples/param_type.ts';
import { type BfDeck__DecksListItem__param } from './BfDeck/DecksListItem/param_type.ts';
import { type BfOrganization__DecksList__param } from './BfOrganization/DecksList/param_type.ts';
import { type BfSample__SampleListItem__param } from './BfSample/SampleListItem/param_type.ts';
import { type CurrentViewer__LoginPage__param } from './CurrentViewer/LoginPage/param_type.ts';
import { type CurrentViewer__RlhfHome__param } from './CurrentViewer/RlhfHome/param_type.ts';
import { type CurrentViewerLoggedIn__Grade__param } from './CurrentViewerLoggedIn/Grade/param_type.ts';
import { type Mutation__JoinWaitlist__param } from './Mutation/JoinWaitlist/param_type.ts';
import { type Query__EntrypointDeckDetailRedirect__param } from './Query/EntrypointDeckDetailRedirect/param_type.ts';
import { type Query__EntrypointGradeDecks__param } from './Query/EntrypointGradeDecks/param_type.ts';
import { type Query__EntrypointGrade__param } from './Query/EntrypointGrade/param_type.ts';
import { type Query__EntrypointHome__param } from './Query/EntrypointHome/param_type.ts';
import { type Query__EntrypointLogin__param } from './Query/EntrypointLogin/param_type.ts';
import { type Query__EntrypointPg__param } from './Query/EntrypointPg/param_type.ts';
import { type Query__EntrypointRlhf__param } from './Query/EntrypointRlhf/param_type.ts';
import { type Query__Eval__param } from './Query/Eval/param_type.ts';
import { type Query__Home__param } from './Query/Home/param_type.ts';
import { type Query__PromptGrade__param } from './Query/PromptGrade/param_type.ts';
import { type Query__RlhfInterface__param } from './Query/RlhfInterface/param_type.ts';
import entrypoint_Mutation__JoinWaitlist from '../__isograph/Mutation/JoinWaitlist/entrypoint.ts';
import entrypoint_Query__EntrypointDeckDetailRedirect from '../__isograph/Query/EntrypointDeckDetailRedirect/entrypoint.ts';
import entrypoint_Query__EntrypointGradeDecks from '../__isograph/Query/EntrypointGradeDecks/entrypoint.ts';
import entrypoint_Query__EntrypointGrade from '../__isograph/Query/EntrypointGrade/entrypoint.ts';
import entrypoint_Query__EntrypointHome from '../__isograph/Query/EntrypointHome/entrypoint.ts';
import entrypoint_Query__EntrypointLogin from '../__isograph/Query/EntrypointLogin/entrypoint.ts';
import entrypoint_Query__EntrypointPg from '../__isograph/Query/EntrypointPg/entrypoint.ts';
import entrypoint_Query__EntrypointRlhf from '../__isograph/Query/EntrypointRlhf/entrypoint.ts';

// This is the type given to regular client fields.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes one parameter
// of type TParam.
type IdentityWithParam<TParam extends object> = <TClientFieldReturn>(
  clientField: (param: TParam) => TClientFieldReturn
) => (param: TParam) => TClientFieldReturn;

// This is the type given it to client fields with @component.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes two parameters.
// The first has type TParam, and the second has type TComponentProps.
//
// TComponentProps becomes the types of the props you must pass
// whenever the @component field is rendered.
type IdentityWithParamComponent<TParam extends object> = <
  TClientFieldReturn,
  TComponentProps = Record<PropertyKey, never>,
>(
  clientComponentField: (data: TParam, componentProps: TComponentProps) => TClientFieldReturn
) => (data: TParam, componentProps: TComponentProps) => TClientFieldReturn;

type WhitespaceCharacter = ' ' | '\t' | '\n';
type Whitespace<In> = In extends `${WhitespaceCharacter}${infer In}`
  ? Whitespace<In>
  : In;

// This is a recursive TypeScript type that matches strings that
// start with whitespace, followed by TString. So e.g. if we have
// ```
// export function iso<T>(
//   isographLiteralText: T & MatchesWhitespaceAndString<'field Query.foo', T>
// ): Bar;
// ```
// then, when you call
// ```
// const x = iso(`
//   field Query.foo ...
// `);
// ```
// then the type of `x` will be `Bar`, both in VSCode and when running
// tsc. This is how we achieve type safety — you can only use fields
// that you have explicitly selected.
type MatchesWhitespaceAndString<
  TString extends string,
  T
> = Whitespace<T> extends `${TString}${string}` ? T : never;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckDetailView', T>
): IdentityWithParamComponent<BfDeck__DeckDetailView__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckGradersTab', T>
): IdentityWithParamComponent<BfDeck__DeckGradersTab__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckInboxTab', T>
): IdentityWithParamComponent<BfDeck__DeckInboxTab__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckSamplesList', T>
): IdentityWithParamComponent<BfDeck__DeckSamplesList__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckSamplesTab', T>
): IdentityWithParamComponent<BfDeck__DeckSamplesTab__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DeckSamples', T>
): IdentityWithParamComponent<BfDeck__DeckSamples__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfDeck.DecksListItem', T>
): IdentityWithParamComponent<BfDeck__DecksListItem__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.DecksList', T>
): IdentityWithParamComponent<BfOrganization__DecksList__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfSample.SampleListItem', T>
): IdentityWithParamComponent<BfSample__SampleListItem__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field CurrentViewer.LoginPage', T>
): IdentityWithParamComponent<CurrentViewer__LoginPage__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field CurrentViewer.RlhfHome', T>
): IdentityWithParamComponent<CurrentViewer__RlhfHome__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field CurrentViewerLoggedIn.Grade', T>
): IdentityWithParamComponent<CurrentViewerLoggedIn__Grade__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.JoinWaitlist', T>
): IdentityWithParam<Mutation__JoinWaitlist__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointDeckDetailRedirect', T>
): IdentityWithParam<Query__EntrypointDeckDetailRedirect__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointGradeDecks', T>
): IdentityWithParam<Query__EntrypointGradeDecks__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointGrade', T>
): IdentityWithParam<Query__EntrypointGrade__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointHome', T>
): IdentityWithParam<Query__EntrypointHome__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointLogin', T>
): IdentityWithParam<Query__EntrypointLogin__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointPg', T>
): IdentityWithParam<Query__EntrypointPg__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointRlhf', T>
): IdentityWithParam<Query__EntrypointRlhf__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.Eval', T>
): IdentityWithParamComponent<Query__Eval__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.Home', T>
): IdentityWithParamComponent<Query__Home__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.PromptGrade', T>
): IdentityWithParamComponent<Query__PromptGrade__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.RlhfInterface', T>
): IdentityWithParamComponent<Query__RlhfInterface__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.JoinWaitlist', T>
): typeof entrypoint_Mutation__JoinWaitlist;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointDeckDetailRedirect', T>
): typeof entrypoint_Query__EntrypointDeckDetailRedirect;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointGradeDecks', T>
): typeof entrypoint_Query__EntrypointGradeDecks;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointGrade', T>
): typeof entrypoint_Query__EntrypointGrade;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointHome', T>
): typeof entrypoint_Query__EntrypointHome;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointLogin', T>
): typeof entrypoint_Query__EntrypointLogin;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointPg', T>
): typeof entrypoint_Query__EntrypointPg;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointRlhf', T>
): typeof entrypoint_Query__EntrypointRlhf;

export function iso(isographLiteralText: string):
  | IdentityWithParam<any>
  | IdentityWithParamComponent<any>
  | IsographEntrypoint<any, any, any>
{
  switch (isographLiteralText) {
    case 'entrypoint Mutation.JoinWaitlist':
      return entrypoint_Mutation__JoinWaitlist;
    case 'entrypoint Query.EntrypointDeckDetailRedirect':
      return entrypoint_Query__EntrypointDeckDetailRedirect;
    case 'entrypoint Query.EntrypointGradeDecks':
      return entrypoint_Query__EntrypointGradeDecks;
    case 'entrypoint Query.EntrypointGrade':
      return entrypoint_Query__EntrypointGrade;
    case 'entrypoint Query.EntrypointHome':
      return entrypoint_Query__EntrypointHome;
    case 'entrypoint Query.EntrypointLogin':
      return entrypoint_Query__EntrypointLogin;
    case 'entrypoint Query.EntrypointPg':
      return entrypoint_Query__EntrypointPg;
    case 'entrypoint Query.EntrypointRlhf':
      return entrypoint_Query__EntrypointRlhf;
  } 
  return (clientFieldResolver: any) => clientFieldResolver;
}