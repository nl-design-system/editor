import { type Context, createContext } from '@lit/context';
import type { ValidationsMap } from '@/types/validation';

export const validationsContext: Context<string, ValidationsMap> = createContext('validations-context');
