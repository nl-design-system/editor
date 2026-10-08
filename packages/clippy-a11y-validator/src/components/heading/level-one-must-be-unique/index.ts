import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const headingLevelOneMustBeUnique = defineValidation({
  condition: (_headingOne, { precedingMatches }) => precedingMatches(selectors.HEADING_ONE).length === 0,
  correction: {
    execute: (headingOne) => () => changeTagName(headingOne, 'h2'),
  },
  documentationId: '0f185b42-34f9-4c50-a3fb-4d0d384d62bf',
  messages,
  rule: headingValidationRules.HEADING_LEVEL_ONE_MUST_BE_UNIQUE,
  scope: 'document',
  selector: selectors.HEADING_ONE,
  severity: validationSeverity.ERROR,
});
