import type { Locale } from './types/messages.ts';
import type { Validation, ValidationSeverity, Violation } from './types/validation.ts';
import { walk } from './walk.ts';

export type ValidatorOptions = {
  fallbackLocale?: Locale;
  locale?: Locale;
  validations?: readonly Validation[];
};

export type ValidateOptions = {
  severities?: readonly ValidationSeverity[];
};

export class Validator {
  readonly #validations = new Map<string, Validation>();
  readonly #locale: Locale;
  readonly #fallbackLocale: Locale;

  constructor({ fallbackLocale = 'nl', locale = 'nl', validations = [] }: ValidatorOptions = {}) {
    this.#locale = locale;
    this.#fallbackLocale = fallbackLocale;
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

  validate(root: ParentNode, { severities }: ValidateOptions = {}): Violation[] {
    return walk(root, [...this.#validations.values()], {
      fallbackLocale: this.#fallbackLocale,
      locale: this.#locale,
      ...(severities === undefined ? {} : { severities }),
    });
  }
}
