import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { unwrapElement } from '../../../utils/dom.ts';
import { paragraphValidationRules } from '../constants.ts';
import { isEntirelyItalic } from '../utils.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotBeEntirelyItalic = defineValidation({
  condition: not(isEntirelyItalic),
  corrections: [
    {
      execute: (paragraph) => () => paragraph.querySelectorAll(selectors.ITALIC).forEach(unwrapElement),
      label: { en: 'Remove italic', nl: 'Schuingedrukt verwijderen' },
      solutionId: 'c105953a-7124-421c-b4ce-1999ffe1793f',
    },
    {
      execute: (paragraph) => () => {
        paragraph.querySelectorAll(selectors.ITALIC).forEach(unwrapElement);
        const blockquote = paragraph.ownerDocument.createElement('blockquote');
        paragraph.replaceWith(blockquote);
        blockquote.append(paragraph);
      },
      label: { en: 'Convert to blockquote', nl: 'Omzetten naar citaat' },
      solutionId: '77bb06bc-47df-4d55-9902-48f641399160',
    },
  ],
  documentationId: 'aeb01c78-8633-47bc-8fff-7aa1eec10130',
  messages,
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_ITALIC,
  scope: 'element',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.WARNING,
});
