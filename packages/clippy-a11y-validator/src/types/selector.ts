import type { selectors } from '../consts/selectors.ts';

export type CoreSelector = (typeof selectors)[keyof typeof selectors];

export type Selector = CoreSelector | (string & Record<never, never>);

export type ElementFor<S extends string> = (S extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[S]
  : HTMLElement) &
  HTMLElement;
