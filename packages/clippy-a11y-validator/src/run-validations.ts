import type { Fragment } from './types/fragment.ts';
import type { Validation, ValidationPayload, Violation } from './types/validation.ts';
import type { LocaleOptions, ValidateOptions } from './types/validator.ts';
import { resolveMessages } from './messages.ts';
import { matchingElements, PageContext } from './page-context.ts';

type Verdict = {
  correct?: () => void;
  payload?: ValidationPayload;
  satisfied: boolean;
};

const validateElement = (validation: Validation, element: HTMLElement, pageContext: PageContext): Verdict => {
  if (validation.scope === 'element') {
    const { condition, correct, payload } = validation;
    if (condition(element)) return { satisfied: true };

    return { correct: correct?.(element), payload: payload?.(element), satisfied: false };
  }

  const { condition, correct, payload } = validation;
  const context = pageContext.for(element);
  if (condition(element, context)) return { satisfied: true };

  return { correct: correct?.(element, context), payload: payload?.(element, context), satisfied: false };
};

export const runValidations = (
  pageContent: readonly Fragment[],
  validations: readonly Validation[],
  options: Required<LocaleOptions> & ValidateOptions,
): Violation[] => {
  const { severities } = options;
  const applicable = validations.filter(({ severity }) => severities === undefined || severities.includes(severity));
  const pageContext = new PageContext(pageContent);

  return matchingElements(pageContent, '*').flatMap((element) =>
    applicable
      .filter(({ selector }) => element.matches(selector))
      .flatMap((validation): Violation[] => {
        const { correct, payload, satisfied } = validateElement(validation, element, pageContext);
        if (satisfied) return [];

        const { messages, rule, scope, severity } = validation;

        return [
          {
            correct,
            element,
            messages: resolveMessages(messages, options.locale, options.fallbackLocale, payload),
            rule,
            scope,
            severity,
            ...(payload === undefined ? {} : { payload }),
          },
        ];
      }),
  );
};
