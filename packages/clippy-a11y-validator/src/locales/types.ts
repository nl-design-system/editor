import type { ValidationKey } from '@/messages';

/** Locales this package ships translations for. */
export type Locale = 'en' | 'nl';

/** Values a validator feeds into its rule's `solution` text. */
export type SolutionParams = Record<string, number | string | boolean | number[]>;

/**
 * A translator already bound to one locale, so callers name only the key.
 * `undefined` when the key is absent.
 */
export type Translate = (key: string, params?: SolutionParams) => string | undefined;

/**
 * A rule's remediation text.
 *
 * Plain strings use rosetta's `{{param}}` interpolation. A function receives the
 * params directly, for wording that has to branch or build a list — each locale
 * writes its own, so grammar stays the translator's business rather than being
 * assembled from fragments in the validator. Both may contain markdown: hosts
 * render it, terminals print it as-is.
 */
export type Solution = string | ((params: SolutionParams) => string);

/** Everything a host needs to present one rule, in one language. */
export type RuleMessage = {
  /** One-line summary of what is wrong. */
  description: string;
  /**
   * Link to the NL Design System guidance for this rule.
   *
   * Lives per locale even though every entry currently points at the same Dutch
   * page, so an English guidance URL can be swapped in later without disturbing
   * the Dutch one.
   */
  href?: string;
  /** How to fix this occurrence. */
  solution?: Solution;
  /** Label for the host's one-click fix, where "Correct" is the wrong verb. */
  correctLabel?: string;
};

/** One locale's catalogue: a message per rule, plus the node names those messages interpolate. */
export type MessageTable = Record<ValidationKey, RuleMessage> & {
  /** Localised names for the node/mark types named in `solution` strings. */
  nodeTypes: Record<string, string>;
};
