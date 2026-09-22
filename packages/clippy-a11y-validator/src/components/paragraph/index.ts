import type { Validation } from '../../types/validation.ts';
import { paragraphValidationRules } from './constants.ts';
import { paragraphShouldNotBeEmpty } from './should-not-be-empty/index.ts';
import { paragraphShouldNotBeEntirelyBold } from './should-not-be-entirely-bold/index.ts';
import { paragraphShouldNotContainEmptyFormatting } from './should-not-contain-empty-formatting/index.ts';
import { paragraphShouldNotContainUnderlinedText } from './should-not-contain-underlined-text/index.ts';
import { paragraphShouldNotResembleHeading } from './should-not-resemble-heading/index.ts';
import { paragraphShouldNotResembleList } from './should-not-resemble-list/index.ts';

export { paragraphValidationRules };

export type ParagraphValidationRule = keyof typeof paragraphValidationRules;

export const paragraphValidations = {
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]: paragraphShouldNotBeEmpty,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: paragraphShouldNotBeEntirelyBold,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING]: paragraphShouldNotContainEmptyFormatting,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT]: paragraphShouldNotContainUnderlinedText,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: paragraphShouldNotResembleHeading,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: paragraphShouldNotResembleList,
} satisfies Record<ParagraphValidationRule, Validation>;
