import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { linkValidationRules } from '../constants.ts';
import { hasLinkText } from '../utils.ts';
import { messages } from './messages.ts';

export const linkShouldNotBeEmpty = defineValidation({
  condition: hasLinkText,
  correction: {
    execute: (link) => () => link.remove(),
  },
  documentationId: 'd43f3487-06f8-4298-9172-be918f62f406',
  messages,
  rule: linkValidationRules.LINK_SHOULD_NOT_BE_EMPTY,
  scope: 'element',
  selector: selectors.LINK,
  severity: validationSeverity.WARNING,
});
