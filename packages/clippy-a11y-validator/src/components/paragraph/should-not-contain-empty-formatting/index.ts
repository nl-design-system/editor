import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { hasTextContent } from '../../../utils/content.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotContainEmptyFormatting = defineValidation({
  condition: hasTextContent,
  corrections: [
    {
      execute: (paragraph) => () => paragraph.remove(),
      label: { en: 'Remove empty paragraph', nl: 'Lege alinea verwijderen' },
      solutionId: '50e14f8a-f248-4c6f-bc76-5e1e79347514',
    },
  ],
  documentationId: '3f813e8f-216d-4ffa-b928-9f2af13f8ef5',
  messages,
  payload: (paragraph) => ({ tag: paragraph.tagName.toLowerCase() }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING,
  scope: 'element',
  selector: selectors.PARAGRAPH_FORMATTING,
  severity: validationSeverity.WARNING,
});
