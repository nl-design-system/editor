import { type TemplateResult } from 'lit';
import { contentValidations, documentValidations } from '@/validators/constants.ts';

type TipFn = (args?: Record<string, number | string | boolean>) => string | TemplateResult | null;

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = ContentValidationKey | DocumentValidationKey;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

export type { ValidationMessages };

function getDocumentLang(): 'en' | 'nl' {
  const lang = document.documentElement.lang.split('-')[0];
  if (lang === 'en' || lang === 'nl') {
    return lang;
  }
  return 'en';
}

export async function getValidationMessages(
  locale: 'en' | 'nl' = getDocumentLang(),
): Promise<ValidationMessages | null> {
  const { validationMessages } = await import(`./locales/${locale}.ts`);
  return validationMessages;
}
