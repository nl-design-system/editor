import type { Fragment } from './types/fragment.ts';
import type { Validation, ValidationPayload, Violation } from './types/validation.ts';
import type { LocaleOptions, ValidateOptions } from './types/validator.ts';
import { matchingElements, DocumentContext } from './document-context.ts';
import { resolveMessages } from './messages.ts';

type Verdict = {
  correct?: () => void;
  payload?: ValidationPayload;
  satisfied: boolean;
};

const validateElement = (validation: Validation, element: HTMLElement, documentContext: DocumentContext): Verdict => {
  if (validation.scope === 'element') {
    const { condition, correct, payload } = validation;
    if (condition(element)) return { satisfied: true };

    return { correct: correct?.(element), payload: payload?.(element), satisfied: false };
  }

  const { condition, correct, payload } = validation;
  const context = documentContext.for(element);
  if (condition(element, context)) return { satisfied: true };

  return { correct: correct?.(element, context), payload: payload?.(element, context), satisfied: false };
};

export const runValidations = (
  documentContent: readonly Fragment[],
  validations: readonly Validation[],
  options: Required<LocaleOptions> & ValidateOptions,
): Violation[] => {
  const { severities } = options;
  const applicable = validations.filter(({ severity }) => severities === undefined || severities.includes(severity));
  const documentContext = new DocumentContext(documentContent);

  return matchingElements(documentContent, '*').flatMap((element) =>
    applicable
      .filter(({ selector }) => element.matches(selector))
      .flatMap((validation): Violation[] => {
        const { correct, payload, satisfied } = validateElement(validation, element, documentContext);
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
