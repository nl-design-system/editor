import type { Fragment, ValidatorOptions, Violation } from '@nl-design-system-community/clippy-a11y-validator';

/** `anchor` locates the source and must stay connected; `fragment` is validated and observed, and may be detached. */
export type SourceRegistration = {
  anchor: Element;
  correct?: ActionHandler;
  focus?: ActionHandler;
  fragment: Fragment;
  label: string;
};

export type RegisteredSource = {
  id: string;
  unregister: () => void;
};

export type DocumentViolation = Violation & {
  correctable: boolean;
  focusable: boolean;
  label: string;
  source: string;
};

export type ActionHandler = (violation: DocumentViolation) => void;

export type ViolationsListener = (violations: readonly DocumentViolation[]) => void;

export type ClippyDocumentOptions = Omit<ValidatorOptions, 'validations'>;
