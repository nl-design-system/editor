import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';

export type EditorSettings = {
  readonly?: boolean;
  /**
   * The validations to run. Defaults to every core validation of
   * `@nl-design-system-community/clippy-a11y-validator`. Pass a subset to run only those, and
   * validations built with `defineValidation` to add your own.
   */
  validations?: readonly Validation[];
};
