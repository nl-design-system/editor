export type Locale = 'en' | 'nl';

export type ValidationMessages = {
  error: string;
  href?: string;
  solution?: string;
  solutions?: Readonly<Record<string, string>>;
};

export type ValidationMessagesByLocale = Partial<Record<Locale, ValidationMessages>> & {
  nl: ValidationMessages;
};

export type ResolvedMessages = {
  error: string;
  href?: string;
  solution?: string;
};
