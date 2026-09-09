import { resemblesListItem } from '../../../conditions/index.ts';
import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { not } from '../../../utils/combinators.ts';
import { convertParagraphsToList, isOrderedListItem, listPrefix } from '../../../utils/list.ts';
import { paragraphValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

export const paragraphShouldNotResembleList = defineValidation({
  condition: not(resemblesListItem),
  correct: (paragraph) => () => convertParagraphsToList(paragraph, isOrderedListItem(paragraph)),
  messages,
  payload: (paragraph) => ({ prefix: listPrefix(paragraph.textContent ?? '').trim() }),
  rule: paragraphValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST,
  scope: 'block',
  selector: selectors.PARAGRAPH,
  severity: validationSeverity.INFO,
});
