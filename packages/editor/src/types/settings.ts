import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';

export type EditorSettings = {
  disableRules?: string[];
  enableRules: string[];
  readonly?: boolean;
  /**
   * The validations to consider, as objects rather than rule keys. Defaults to every core
   * validation of `@nl-design-system-community/clippy-a11y-validator`. `enableRules` and
   * `disableRules` filter whatever is given here.
   */
  validations?: readonly Validation[];
};
