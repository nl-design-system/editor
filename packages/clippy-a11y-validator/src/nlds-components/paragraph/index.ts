import type { Validator } from '../../types.ts';
import { paragraphShouldNotBeEntirelyBold } from './should-not-be-entirely-bold';

export { paragraphShouldNotBeEntirelyBold };

export const paragraphValidators: readonly Validator[] = [paragraphShouldNotBeEntirelyBold];
