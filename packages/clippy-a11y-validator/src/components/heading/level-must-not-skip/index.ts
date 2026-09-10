import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { expectedHeadingLevel, headingLevel, precedingHeading } from '../utils.ts';
import { messages } from './messages.ts';

export const headingLevelMustNotSkip = defineValidation({
  condition: (heading, context) => {
    const preceding = precedingHeading(context);

    return preceding === null || headingLevel(heading) <= headingLevel(preceding) + 1;
  },
  correct: (heading, context) => () => changeTagName(heading, `h${expectedHeadingLevel(context)}`),
  messages,
  payload: (heading, context) => ({
    expectedHeadingLevel: expectedHeadingLevel(context),
    headingLevel: headingLevel(heading),
    precedingHeadingLevel: headingLevel(precedingHeading(context) ?? heading),
  }),
  rule: headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP,
  scope: 'page',
  selector: selectors.HEADING,
  severity: validationSeverity.WARNING,
});
