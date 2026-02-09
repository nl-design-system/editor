import { type TemplateResult } from 'lit';
import { getDocumentLang, type Locale } from '@/localization.ts';
import { contentValidations, documentValidations } from '@/validators/constants.ts';

type TipFn = (args?: Record<string, number | string | boolean>) => string | TemplateResult | null;

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = ContentValidationKey | DocumentValidationKey;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

export type { ValidationMessages };

export async function getValidationMessages(locale: Locale = getDocumentLang()): Promise<ValidationMessages | null> {
  const { validationMessages } = await import(`./locales/${locale}.ts`);
  return validationMessages;
}
