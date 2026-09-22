import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { expectedHeadingLevel, headingLevel, precedingHeading } from '../utils.ts';
import { messages } from './messages.ts';

export const headingLevelMustNotSkip = defineValidation({
  condition: (heading, root) => {
    const preceding = precedingHeading(heading, root);

    return preceding === null || headingLevel(heading) <= headingLevel(preceding) + 1;
  },
  correct: (heading, root) => () => changeTagName(heading, `h${expectedHeadingLevel(heading, root)}`),
  messages,
  payload: (heading, root) => ({
    expectedHeadingLevel: expectedHeadingLevel(heading, root),
    headingLevel: headingLevel(heading),
    precedingHeadingLevel: headingLevel(precedingHeading(heading, root) ?? heading),
  }),
  rule: headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP,
  scope: 'page',
  selector: selectors.HEADING,
  severity: validationSeverity.WARNING,
});
