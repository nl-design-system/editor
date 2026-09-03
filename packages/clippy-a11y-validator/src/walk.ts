import type { Locale } from './types/messages.ts';
import type { Validation, ValidationSeverity, Violation } from './types/validation.ts';
import { resolveMessages } from './messages.ts';

export type WalkOptions = {
  fallbackLocale: Locale;
  locale: Locale;
  severities?: readonly ValidationSeverity[];
};

const violate = (validation: Validation, element: HTMLElement, options: WalkOptions): Violation | null => {
  const { condition, correct, messages, payload, rule, scope, selector, severity } = validation;

  if (!element.matches(selector)) return null;
  if (condition(element)) return null;

  const violationPayload = payload?.(element);

  return {
    correct: correct?.(element),
    element,
    messages: resolveMessages(messages, options.locale, options.fallbackLocale, violationPayload),
    rule,
    scope,
    severity,
    ...(violationPayload === undefined ? {} : { payload: violationPayload }),
  };
};

export const walk = (root: ParentNode, validations: readonly Validation[], options: WalkOptions): Violation[] => {
  const { severities } = options;
  const applicable = severities ? validations.filter(({ severity }) => severities.includes(severity)) : validations;

  return [...root.querySelectorAll('*')].flatMap((element) => {
    if (!(element instanceof HTMLElement)) return [];

    return applicable
      .map((validation) => violate(validation, element, options))
      .filter((violation) => violation !== null);
  });
};
