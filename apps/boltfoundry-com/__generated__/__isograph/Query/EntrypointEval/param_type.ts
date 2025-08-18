import { type Query__Eval__output_type } from '../../Query/Eval/output_type.ts';
import type { Query__EntrypointEval__parameters } from './parameters_type.ts';

export type Query__EntrypointEval__param = {
  readonly data: {
    readonly Eval: Query__Eval__output_type,
  },
  readonly parameters: Query__EntrypointEval__parameters,
};
