import type {
  Fragment,
  ValidatorConstructorOptions,
  Violation,
} from '@nl-design-system-community/clippy-a11y-validator';

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

export type DocumentViolation = Violation & {
  source: string;
};

export type ViolationsListener = (violations: readonly DocumentViolation[]) => void;

export type ClippyDocumentOptions = Omit<ValidatorConstructorOptions, 'validations'>;
