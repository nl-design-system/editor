export type Locale = 'en' | 'nl';

export type ValidationMessages = {
  error: string;
  href?: string;
  solution?: string;
};

/**
 * Text in every locale that has it. `nl` is the source language, so it is always there and the
 * fallback chain can never bottom out.
 */
export type ByLocale<T> = Partial<Record<Locale, T>> & { nl: T };

export type ValidationMessagesByLocale = ByLocale<ValidationMessages>;

export type ResolvedMessages = {
  error: string;
  href?: string;
  solution?: string;
};
