export type Locale = 'en' | 'nl';

export type ValidationMessages = {
  explanation?: string;
  href?: string;
  solution?: string;
  title?: string;
};

/**
 * Text in every locale that has it. `nl` is the source language, so it is always there and the
 * fallback chain can never bottom out.
 */
export type ByLocale<T> = { en?: T; nl: T };

export type ValidationMessagesByLocale = ByLocale<ValidationMessages>;

export type ResolvedMessages = {
  explanation?: string;
  href?: string;
  solution?: string;
  title: string;
};
