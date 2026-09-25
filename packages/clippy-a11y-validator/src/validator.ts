import type { Fragment } from './types/fragment.ts';
import type { Locale } from './types/messages.ts';
import type { Validation, Violation } from './types/validation.ts';
import type { ValidateOptions, ValidatorOptions } from './types/validator.ts';
import { runValidations } from './run-validations.ts';

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

  validate(pageContent: readonly Fragment[], { severities }: ValidateOptions = {}): Violation[] {
    return runValidations(pageContent, [...this.#validations.values()], {
      fallbackLocale: this.#fallbackLocale,
      locale: this.#locale,
      ...(severities === undefined ? {} : { severities }),
    });
  }
}
