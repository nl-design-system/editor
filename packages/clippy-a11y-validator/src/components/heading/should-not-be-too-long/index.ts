import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { hasHeadingLength } from '../utils.ts';
import { messages } from './messages.ts';

export const headingShouldNotBeTooLong = defineValidation({
  condition: hasHeadingLength,
  corrections: [
    {
      execute: (heading) => () => changeTagName(heading, 'p'),
      label: { en: 'Convert to paragraph', nl: 'Omzetten naar alinea' },
    },
  ],
  documentationId: '586da28e-8e70-4844-a0dd-61eb4ecd7017',
  messages,
  rule: headingValidationRules.HEADING_SHOULD_NOT_BE_TOO_LONG,
  scope: 'element',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
