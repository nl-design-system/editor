import type { ValidatorOptions, Violation } from '@nl-design-system-community/clippy-a11y-validator';

// `anchor` places the source on the page and must stay connected; `root` is what gets validated and observed, and may be detached.
// Static markup: anchor and root are the same element.
// CKEditor: anchor is the editor element, root its editable.
// Title field: anchor is the input, root a detached container with a proxy `<h1>` kept in sync with the input value.
export type SourceRegistration = {
  anchor: Element;
  label: string;
  root: ParentNode;
};

export type RegisteredSource = {
  id: string;
  unregister: () => void;
};

export type RegistryViolation = Violation & {
  source: string;
};

export type RegistryListener = (violations: readonly RegistryViolation[]) => void;

export type ClippyRegistryOptions = Omit<ValidatorOptions, 'validations'>;
