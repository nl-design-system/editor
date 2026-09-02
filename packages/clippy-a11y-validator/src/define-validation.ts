import type { ElementFor, Selector } from './types/selector.ts';
import type { Validation, ValidationDefinition } from './types/validation.ts';

export const defineValidation = <S extends Selector>(definition: ValidationDefinition<S, ElementFor<S>>): Validation =>
  definition as unknown as Validation;
