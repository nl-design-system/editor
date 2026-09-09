import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel, precedingHeading } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * Anchored on the first heading rather than the first block: a page wrapper, skip link or `<nav>` is
 * routinely the first element, so only the first *heading* says anything about the document outline.
 * A document without any headings at all is therefore not reported.
 */
export const headingMustStartAtLevelOne = defineValidation({
  condition: (heading, root) => precedingHeading(heading, root) !== null || heading.tagName === 'H1',
  correct: (heading) => () => changeTagName(heading, 'h1'),
  messages,
  payload: (heading) => ({ headingLevel: headingLevel(heading) }),
  rule: headingValidationRules.HEADING_MUST_START_AT_LEVEL_ONE,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
