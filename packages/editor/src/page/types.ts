import type { Fragment, ValidatorOptions, Violation } from '@nl-design-system-community/clippy-a11y-validator';

/** `anchor` locates the source and must stay connected; `fragment` is validated and observed, and may be detached. */
export type SourceRegistration = {
  anchor: Element;
  fragment: Fragment;
  label: string;
};

export type RegisteredSource = {
  id: string;
  unregister: () => void;
};

export type PageViolation = Violation & {
  source: string;
};

export type ViolationsListener = (violations: readonly PageViolation[]) => void;

export type ClippyPageOptions = Omit<ValidatorOptions, 'validations'>;
