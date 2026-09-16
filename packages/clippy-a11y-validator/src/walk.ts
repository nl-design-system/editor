import type { Locale } from './types/messages.ts';
import type {
  Validation,
  ValidationContext,
  ValidationPayload,
  ValidationSeverity,
  Violation,
} from './types/validation.ts';
import { matchingElements, pageContext } from './context.ts';
import { resolveMessages } from './messages.ts';

export type WalkOptions = {
  fallbackLocale: Locale;
  locale: Locale;
  severities?: readonly ValidationSeverity[];
};

type Verdict = {
  correct?: () => void;
  payload?: ValidationPayload;
  satisfied: boolean;
};

const validateElement = (
  validation: Validation,
  element: HTMLElement,
  contextFor: (element: HTMLElement) => ValidationContext,
): Verdict => {
  if (validation.scope === 'element') {
    const { condition, correct, payload } = validation;
    if (condition(element)) return { satisfied: true };

    return { correct: correct?.(element), payload: payload?.(element), satisfied: false };
  }

  const { condition, correct, payload } = validation;
  const context = contextFor(element);
  if (condition(element, context)) return { satisfied: true };

  return { correct: correct?.(element, context), payload: payload?.(element, context), satisfied: false };
};

export const walk = (
  composedContent: readonly ParentNode[],
  validations: readonly Validation[],
  options: WalkOptions,
): Violation[] => {
  const { severities } = options;
  const applicable = validations.filter(({ severity }) => severities === undefined || severities.includes(severity));
  const contextFor = pageContext(composedContent);

  return matchingElements(composedContent, '*').flatMap((element) =>
    applicable
      .filter(({ selector }) => element.matches(selector))
      .flatMap((validation): Violation[] => {
        const { correct, payload, satisfied } = validateElement(validation, element, contextFor);
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
