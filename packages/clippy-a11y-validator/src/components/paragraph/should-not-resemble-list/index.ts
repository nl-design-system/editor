import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { paragraphValidationRules } from '../constants.ts';
import { convertParagraphsToList, isOrderedListItem, listPrefix, resemblesListItem } from '../utils.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotResembleList = defineValidation({
  condition: not(resemblesListItem),
  corrections: [
    {
      applies: not(isOrderedListItem),
      execute:
        (paragraph, { subsequentSiblingMatches }) =>
        () =>
          convertParagraphsToList(paragraph, false, subsequentSiblingMatches(paragraph.localName)),
      label: { en: 'Convert to bulleted list', nl: 'Omzetten naar opsomming' },
      solutionId: 'e7347d49-e751-4f82-9105-0f8ef77e3bba',
    },
    {
      applies: isOrderedListItem,
      execute:
        (paragraph, { subsequentSiblingMatches }) =>
        () =>
          convertParagraphsToList(paragraph, true, subsequentSiblingMatches(paragraph.localName)),
      label: { en: 'Convert to numbered list', nl: 'Omzetten naar genummerde lijst' },
      solutionId: '77ec1d80-1931-40f3-bf4a-502cdffb98c6',
    },
  ],
  documentationId: 'af5a0a05-bf3a-4218-b0de-f635f00a1456',
  messages,
  payload: (paragraph) => ({ prefix: listPrefix(paragraph.textContent ?? '').trim() }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST,
  scope: 'document',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
