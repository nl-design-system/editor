import { type Context, createContext } from '@lit/context';
import { a11yValidations } from '@/validation/a11yValidations.ts';

export type ValidationSeverity = 'warning' | 'error';
export type ValidationMeta = {
  severity: ValidationSeverity;
  ignore: boolean;
  pos: number;
  id: typeof a11yValidations;
};
export type ValidationsMap = Map<string, ValidationMeta>;

export const validationsContext: Context<string, ValidationsMap> = createContext('validations-context');
