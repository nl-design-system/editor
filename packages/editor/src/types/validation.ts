import { a11yValidations } from '../validation/a11yValidations.ts';

export interface ValidationError {
  id: typeof a11yValidations;
  position: number;
}
