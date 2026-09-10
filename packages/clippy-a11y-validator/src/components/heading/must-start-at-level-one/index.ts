import { defaultValidationContext, selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel, precedingHeading } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * Anchored on the first heading rather than the first block: a page wrapper, skip link or `<nav>` is
 * routinely the first element, so only the first *heading* says anything about the document outline.
 * A document without any headings at all is therefore not reported.
 *
 * The expected level is the document's `topHeadingLevel`, which is `1` for a standalone document and
 * deeper for content embedded under an existing outline.
 */
export const headingMustStartAtLevelOne = defineValidation({
  condition: (heading, root, { topHeadingLevel } = defaultValidationContext) =>
    precedingHeading(heading, root) !== null || headingLevel(heading) === topHeadingLevel,
  correct:
    (heading, _root, { topHeadingLevel } = defaultValidationContext) =>
    () =>
      changeTagName(heading, `h${topHeadingLevel}`),
  messages,
  payload: (heading, _root, { topHeadingLevel } = defaultValidationContext) => ({
    headingLevel: headingLevel(heading),
    topHeadingLevel,
  }),
  rule: headingValidationRules.HEADING_MUST_START_AT_LEVEL_ONE,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.INFO,
});
