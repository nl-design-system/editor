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
  correction: {
    execute: (heading, context) => () => changeTagName(heading, `h${expectedHeadingLevel(context)}`),
  },
  documentationId: '2bd2f0a4-fa95-4ce5-8e16-1dfd7d959193',
  messages,
  payload: (heading, context) => ({
    expectedHeadingLevel: expectedHeadingLevel(context),
    headingLevel: headingLevel(heading),
    precedingHeadingLevel: headingLevel(precedingHeading(context) ?? heading),
  }),
  rule: headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP,
  scope: 'document',
  selector: selectors.HEADING,
  severity: validationSeverity.WARNING,
});
