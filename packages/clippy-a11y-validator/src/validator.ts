import type { Locale } from './types/messages.ts';
import type { Validation, ValidationSeverity, Violation } from './types/validation.ts';
import { DEFAULT_TOP_HEADING_LEVEL } from './consts/index.ts';
import { walk } from './walk.ts';

export type ValidatorOptions = {
  fallbackLocale?: Locale;
  locale?: Locale;
  /** Highest heading level the document may use. Defaults to `1`. */
  topHeadingLevel?: number;
  validations?: readonly Validation[];
};

export type ValidateOptions = {
  severities?: readonly ValidationSeverity[];
  /** Overrides the validator's `topHeadingLevel` for this run. */
  topHeadingLevel?: number;
};

export class Validator {
  readonly #validations = new Map<string, Validation>();
  readonly #locale: Locale;
  readonly #fallbackLocale: Locale;
  readonly #topHeadingLevel: number;

  constructor({
    fallbackLocale = 'nl',
    locale = 'nl',
    topHeadingLevel = DEFAULT_TOP_HEADING_LEVEL,
    validations = [],
  }: ValidatorOptions = {}) {
    this.#locale = locale;
    this.#fallbackLocale = fallbackLocale;
    this.#topHeadingLevel = topHeadingLevel;
    validations.forEach((validation) => this.register(validation));
  }

  register(validation: Validation): () => void {
    this.#validations.set(validation.rule, validation);

    return () => {
      if (this.#validations.get(validation.rule) === validation) {
        this.#validations.delete(validation.rule);
      }
    };
  }

  validate(root: ParentNode, { severities, topHeadingLevel }: ValidateOptions = {}): Violation[] {
    return walk(root, [...this.#validations.values()], {
      context: { topHeadingLevel: topHeadingLevel ?? this.#topHeadingLevel },
      fallbackLocale: this.#fallbackLocale,
      locale: this.#locale,
      ...(severities === undefined ? {} : { severities }),
    });
  }
}
