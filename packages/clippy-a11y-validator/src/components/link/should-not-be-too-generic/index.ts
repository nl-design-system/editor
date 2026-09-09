import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { linkValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const GENERIC_LINK_TEXTS = new Set(['klik hier', 'lees meer']); //

const linkText = (link: HTMLAnchorElement): string => (link.textContent ?? '').trim();

/**
 * No `correct`: replacing the text would mean inventing copy. The editor selects the link so the author
 * can rewrite it, which needs an editing surface this package does not have.
 */
export const linkShouldNotBeTooGeneric = defineValidation({
  condition: (link) => !GENERIC_LINK_TEXTS.has(linkText(link).toLowerCase()),
  messages,
  payload: (link) => ({ text: linkText(link) }),
  rule: linkValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC,
  scope: 'inline',
  selector: selectors.LINK,
  severity: validationSeverity.INFO,
});
