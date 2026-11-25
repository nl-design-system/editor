import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not, or } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { resemblesHeading } from '../should-not-resemble-heading/index.ts';
import { isEntirelyBold, replaceWithHeading } from '../utils.ts';
import { messages } from './messages.ts';

const isNotEntirelyBold = not(isEntirelyBold);

/** A bold paragraph that reads as a heading is left to `PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING`. */
export const paragraphShouldNotBeEntirelyBold = defineValidation({
  condition: or(isNotEntirelyBold, resemblesHeading),
  corrections: [
    {
      execute: (paragraph) => () => paragraph.querySelectorAll(selectors.BOLD).forEach(unwrapElement),
      label: { en: 'Remove bold', nl: 'Dikgedrukt verwijderen' },
      solutionId: '1fe5239b-fc3f-4855-b25f-e2f5e12fe754',
    },
    {
      execute: (paragraph, context) => () => replaceWithHeading(paragraph, context),
      label: { en: 'Convert to heading', nl: 'Omzetten naar kop' },
      solutionId: '74aecf37-a8b4-4f1e-bb94-ece433dae463',
    },
  ],
  documentationId: 'd9c53eaf-16dd-42eb-bcc4-7d9f97283309',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
