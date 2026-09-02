import type { Validation } from '../../types/validation.ts';
import { paragraphShouldNotBeEntirelyBold } from './should-not-be-entirely-bold/index.ts';

export { paragraphShouldNotBeEntirelyBold };

export const paragraphValidations: readonly Validation[] = [paragraphShouldNotBeEntirelyBold];
