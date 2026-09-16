import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingMustStartAtLevelOne = defineValidation({
  condition: (heading, { precedingMatches }) =>
    precedingMatches(selectors.HEADING).length > 0 || heading.tagName === 'H1',
  correct: (heading) => () => changeTagName(heading, 'h1'),
  messages,
  payload: (heading) => ({ headingLevel: headingLevel(heading) }),
  rule: headingValidationRules.HEADING_MUST_START_AT_LEVEL_ONE,
  scope: 'page',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
