import { selectors, validationSeverity } from '../../../consts/index.ts';
import { defineValidation } from '../../../define-validation.ts';
import { changeTagName, headingLevel, precedingHeading } from '../../../utils/dom.ts';
import { headingValidationRules } from '../constants.ts';
import { messages } from './messages.ts';

const MAX_HEADING_LEVEL = 6;

const expectedLevel = (heading: HTMLElement, root: ParentNode): number => {
  const preceding = precedingHeading(heading, root);

  return preceding === null ? 1 : Math.min(headingLevel(preceding) + 1, MAX_HEADING_LEVEL);
};

export const headingLevelMustNotSkip = defineValidation({
  condition: (heading, root) => {
    const preceding = precedingHeading(heading, root);

    return preceding === null || headingLevel(heading) <= headingLevel(preceding) + 1;
  },
  correct: (heading, root) => () => changeTagName(heading, `h${expectedLevel(heading, root)}`),
  messages,
  payload: (heading, root) => ({
    expectedHeadingLevel: expectedLevel(heading, root),
    headingLevel: headingLevel(heading),
    precedingHeadingLevel: headingLevel(precedingHeading(heading, root) ?? heading),
  }),
  rule: headingValidationRules.HEADING_LEVEL_MUST_NOT_SKIP,
  scope: 'block',
  selector: selectors.HEADING,
  severity: validationSeverity.WARNING,
});
