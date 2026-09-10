import { defaultValidationContext, selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

/**
 * Content embedded under an existing outline may not reach above the level it is nested at:
 * a fragment rendered below the host page's `<h1>` must start at `<h2>` or deeper, otherwise it
 * claims a level that belongs to the surrounding page.
 *
 * A standalone document has `topHeadingLevel: 1`, which no heading can exceed, so this never fires.
 */
export const headingMustNotBeAboveTopLevel = defineValidation({
  condition: (heading, _root, { topHeadingLevel } = defaultValidationContext) =>
    headingLevel(heading) >= topHeadingLevel,
  correct:
    (heading, _root, { topHeadingLevel } = defaultValidationContext) =>
    () =>
      changeTagName(heading, `h${topHeadingLevel}`),
  messages,
  payload: (heading, _root, { topHeadingLevel } = defaultValidationContext) => ({
    headingLevel: headingLevel(heading),
    topHeadingLevel,
  }),
  rule: headingValidationRules.HEADING_MUST_NOT_BE_ABOVE_TOP_LEVEL,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.ERROR,
});
