import type { Validation } from '../../types/validation.ts';
import { headingValidationRules } from './constants.ts';
import { headingLevelMustNotSkip } from './level-must-not-skip/index.ts';
import { headingLevelOneMustBeUnique } from './level-one-must-be-unique/index.ts';
import { headingMustNotBeEmpty } from './must-not-be-empty/index.ts';
import { headingMustStartAtLevelOne } from './must-start-at-level-one/index.ts';
import { headingShouldNotContainBoldOrItalic } from './should-not-contain-bold-or-italic/index.ts';

export type HeadingValidationRule = keyof typeof headingValidationRules;

export const headingValidations = {
  [headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP]: headingLevelMustNotSkip,
  [headingValidationRules.HEADING_LEVEL_ONE_MUST_BE_UNIQUE]: headingLevelOneMustBeUnique,
  [headingValidationRules.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [headingValidationRules.HEADING_MUST_START_AT_LEVEL_ONE]: headingMustStartAtLevelOne,
  [headingValidationRules.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
} satisfies Record<HeadingValidationRule, Validation>;
