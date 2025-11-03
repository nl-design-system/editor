import { a11yValidations } from '../validation/a11yValidations.ts';

export type ValidationErrorId = (typeof a11yValidations)[keyof typeof a11yValidations];

export type BoundingBox = { top: number; height: number };

export interface ValidationError {
  id: ValidationErrorId;
  position: number;
}
