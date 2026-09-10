import type { Locale } from './messages.ts';
import type { Validation, ValidationSeverity } from './validation.ts';

export type LocaleOptions = {
  fallbackLocale?: Locale;
  locale?: Locale;
};

export type ValidatorConstructorOptions = LocaleOptions & {
  validations?: readonly Validation[];
};

export type ValidatorRunOptions = {
  severities?: readonly ValidationSeverity[];
};
