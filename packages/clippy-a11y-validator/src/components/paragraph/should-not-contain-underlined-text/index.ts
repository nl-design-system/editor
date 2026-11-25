import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/** Underlined text reads as a link, so a `u` element is never acceptable and the condition never holds. */
export const paragraphShouldNotContainUnderlinedText = defineValidation({
  condition: () => false,
  corrections: [
    {
      execute: (underline) => () => unwrapElement(underline),
      label: { en: 'Remove underline', nl: 'Onderstreping verwijderen' },
      solutionId: 'e9754076-2d72-48f5-a64f-ca05a875e0b0',
    },
  ],
  documentationId: 'fe56a126-ed5b-406f-8240-fedd5b25d7cd',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT,
  scope: 'element',
  selector: selectors.PARAGRAPH_UNDERLINE,
  severity: validationSeverity.INFO,
});
