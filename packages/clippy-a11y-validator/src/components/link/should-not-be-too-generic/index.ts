import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { trimmedText } from '../../../utils/dom.ts';
import { linkValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const GENERIC_LINK_TEXTS = new Set(['klik hier', 'lees meer']);

/**
 * No `correction`: a useful link text describes where the link goes, which only the author can provide.
 */
export const linkShouldNotBeTooGeneric = defineValidation({
  condition: (link) => !GENERIC_LINK_TEXTS.has(trimmedText(link).toLowerCase()),
  messages,
  payload: (link) => ({ text: trimmedText(link) }),
  rule: linkValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC,
  scope: 'element',
  selector: selectors.LINK,
  severity: validationSeverity.INFO,
});
