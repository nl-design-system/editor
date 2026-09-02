import type { Validation } from '../types/validation.ts';
import { paragraphValidations } from './paragraph/index.ts';

export const coreValidations: readonly Validation[] = [...paragraphValidations];
