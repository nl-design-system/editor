import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { paragraphValidationRules } from '../constants.ts';
import { convertParagraphsToList, isOrderedListItem, listPrefix, resemblesListItem } from '../utils.ts';
import { messages } from './messages.ts';

const UNORDERED_LIST_SOLUTION_ID = 'e7347d49-e751-4f82-9105-0f8ef77e3bba';
const ORDERED_LIST_SOLUTION_ID = '77ec1d80-1931-40f3-bf4a-502cdffb98c6';

export const paragraphShouldNotResembleList = defineValidation({
  condition: not(resemblesListItem),
  corrections: [
    {
      execute:
        (paragraph, { subsequentSiblingMatches }) =>
        () =>
          convertParagraphsToList(
            paragraph,
            isOrderedListItem(paragraph),
            subsequentSiblingMatches(paragraph.localName),
          ),
      label: { en: 'Convert to list', nl: 'Omzetten naar lijst' },
      solutionId: '{listSolutionId}',
    },
  ],
  documentationId: 'af5a0a05-bf3a-4218-b0de-f635f00a1456',
  messages,
  payload: (paragraph) => ({
    listSolutionId: isOrderedListItem(paragraph) ? ORDERED_LIST_SOLUTION_ID : UNORDERED_LIST_SOLUTION_ID,
    prefix: listPrefix(paragraph.textContent ?? '').trim(),
  }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST,
  scope: 'document',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
