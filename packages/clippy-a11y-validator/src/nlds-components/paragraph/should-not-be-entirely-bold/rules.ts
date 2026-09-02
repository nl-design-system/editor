import { isEntirelyBold } from '../rules.ts';

export const isNotEntirelyBold = (paragraph: HTMLElement): boolean => !isEntirelyBold(paragraph);
