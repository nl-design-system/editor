import type { ValidationContext, ValidationPayload } from '../../../types/validation.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel, nextHeadingLevel } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const precedingHeading = ({ previous }: ValidationContext): HTMLElement | null => previous(selectors.HEADING);

export const headingLevelMustNotSkip = defineValidation({
  condition: (heading, context) => {
    const preceding = precedingHeading(context);

    return preceding === null || headingLevel(heading) <= headingLevel(preceding) + 1;
  },
  correct: (heading, context) => () => {
    const preceding = precedingHeading(context);
    if (preceding === null) return;

    changeTagName(heading, `h${nextHeadingLevel(preceding)}`);
  },
  messages,
  payload: (heading, context): ValidationPayload => {
    const preceding = precedingHeading(context);
    if (preceding === null) return { headingLevel: headingLevel(heading) };

    return {
      expectedHeadingLevel: nextHeadingLevel(preceding),
      headingLevel: headingLevel(heading),
      precedingHeadingLevel: headingLevel(preceding),
    };
  },
  rule: headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP,
  scope: 'page',
  selector: selectors.HEADING,
  severity: validationSeverity.WARNING,
});
