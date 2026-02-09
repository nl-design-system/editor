import { type TemplateResult } from 'lit';
import { allLocales, sourceLocale } from '@/generated/locale-codes.ts';
import { contentValidations, documentValidations } from '@/validators/constants.ts';

type TipFn = (args?: Record<string, number | string | boolean>) => string | TemplateResult | null;

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = ContentValidationKey | DocumentValidationKey;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

export type { ValidationMessages };

function getDocumentLang() {
  const lang = document.documentElement.lang.split('-')[0];
  return allLocales.find((locale) => lang === locale) ?? sourceLocale;
}

export async function getValidationMessages(
  locale: 'en' | 'nl' = getDocumentLang(),
): Promise<ValidationMessages | null> {
  const { validationMessages } = await import(`./locales/${locale}.ts`);
  return validationMessages;
}
