import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingLevelOneMustBeUnique = defineValidation({
  condition: (headingOne, root) => root.querySelector(selectors.HEADING_ONE) === headingOne,
  correct: (headingOne) => () => changeTagName(headingOne, 'h2'),
  messages,
  rule: headingValidationRules.HEADING_LEVEL_ONE_MUST_BE_UNIQUE,
  scope: 'block',
  selector: selectors.HEADING_ONE,
  severity: validationSeverity.ERROR,
});
