import type { Locale } from './types/messages.ts';
import type { Validation, ValidationContext, ValidationSeverity, Violation } from './types/validation.ts';
import { resolveMessages } from './messages.ts';

export type WalkOptions = {
  context: ValidationContext;
  fallbackLocale: Locale;
  locale: Locale;
  severities?: readonly ValidationSeverity[];
};

const violate = (
  validation: Validation,
  element: HTMLElement,
  root: ParentNode,
  options: WalkOptions,
): Violation | null => {
  const { condition, correct, messages, payload, rule, scope, selector, severity } = validation;
  const { context } = options;

  if (!element.matches(selector)) return null;
  if (condition(element, root, context)) return null;

  const violationPayload = payload?.(element, root, context);

  return {
    correct: correct?.(element, root, context),
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
      .map((validation) => violate(validation, element, root, options))
      .filter((violation) => violation !== null);
  });
};
