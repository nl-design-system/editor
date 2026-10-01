import { type Context, createContext } from '@lit/context';
import type { ViolationsMap } from '@/types/validation';

export const violationsContext: Context<string, ViolationsMap> = createContext('violations-context');
