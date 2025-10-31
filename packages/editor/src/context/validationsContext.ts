import { type Context, createContext } from '@lit/context';
import type { BoundingBox, ValidationErrorId } from '@/types/validation.ts';

export type ValidationSeverity = 'warning' | 'error';
export type ValidationMeta = {
  boundingBox: BoundingBox | null;
  severity: ValidationSeverity;
  ignore: boolean;
  pos: number;
  id: ValidationErrorId;
};
export type ValidationsMap = Map<string, ValidationMeta>;

export const validationsContext: Context<string, ValidationsMap> = createContext('validations-context');
