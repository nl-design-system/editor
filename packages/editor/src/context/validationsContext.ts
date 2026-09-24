import { type Context, createContext } from '@lit/context';
import type { ViolationsMap } from '@/types/validation';

export const validationsContext: Context<string, ViolationsMap> = createContext('validations-context');
