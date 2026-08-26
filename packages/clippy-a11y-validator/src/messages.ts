import type { Locale } from './locales/types';
import {
  definitionListValidations,
  headingValidations,
  imageValidations,
  linkValidations,
  paragraphValidations,
  richTextContentValidations,
  tableValidations,
  validations,
} from './constants';
import { translator } from './i18n';

export type ValidationKey =
  | (typeof headingValidations)[keyof typeof headingValidations]
  | (typeof paragraphValidations)[keyof typeof paragraphValidations]
  | (typeof linkValidations)[keyof typeof linkValidations]
  | (typeof imageValidations)[keyof typeof imageValidations]
  | (typeof tableValidations)[keyof typeof tableValidations]
  | (typeof definitionListValidations)[keyof typeof definitionListValidations]
  | (typeof richTextContentValidations)[keyof typeof richTextContentValidations];

/** A rule's presentation text in one language — the resolved form of a locale-table entry. */
export type ValidationMessage = {
  heading: string;
  href?: string;
  correctLabel?: string;
};

export const validationKeys: ValidationKey[] = Object.values(validations);

/**
 * Every rule's presentation text in `locale` (default `'en'`) — the single
 * catalogue both the static reporter and a host UI read from.
 *
 * Solutions are not here: they depend on the offending node, so they are attached
 * per result by the validator that detected the issue.
 */
export const validationMessages = (locale?: Locale): Record<ValidationKey, ValidationMessage> => {
  const t = translator(locale);

  return Object.fromEntries(
    validationKeys.map((key) => [
      key,
      {
        correctLabel: t(`${key}.correctLabel`),
        heading: t(`${key}.heading`) ?? key,
        href: t(`${key}.href`),
      },
    ]),
  ) as Record<ValidationKey, ValidationMessage>;
};
