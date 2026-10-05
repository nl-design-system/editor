import type { Fragment } from './types/fragment.ts';
import type { ByLocale, Locale } from './types/messages.ts';
import type {
  CorrectViolationFunction,
  Validation,
  Violation,
  ViolationCorrection,
  ViolationPayload,
} from './types/validation.ts';
import type { LocaleOptions, ValidatorRunOptions } from './types/validator.ts';
import { matchingElements, DocumentContext } from './document-context.ts';
import { resolveLocalised, resolveMessages } from './messages.ts';

/** A correction bound to the element it flagged, before its label is resolved for a locale. */
type BoundCorrection = {
  execute: CorrectViolationFunction;
  label?: ByLocale<string>;
};

type Verdict = {
  correction?: BoundCorrection;
  focus?: () => void;
  payload?: ViolationPayload;
  satisfied: boolean;
};

const localiseCorrection = (
  { execute, label }: BoundCorrection,
  locale: Locale,
  fallbackLocale: Locale,
): ViolationCorrection => ({
  execute,
  ...(label === undefined ? {} : { label: resolveLocalised(label, locale, fallbackLocale) }),
});

const validateElement = (validation: Validation, element: HTMLElement, documentContext: DocumentContext): Verdict => {
  if (validation.scope === 'element') {
    const { condition, correction, focus, payload } = validation;
    if (condition(element)) return { satisfied: true };

    return {
      correction: correction && { ...correction, execute: correction.execute(element) },
      focus: focus?.(element),
      payload: payload?.(element),
      satisfied: false,
    };
  }

  const { condition, correction, focus, payload } = validation;
  const context = documentContext.for(element);
  if (condition(element, context)) return { satisfied: true };

  return {
    correction: correction && { ...correction, execute: correction.execute(element, context) },
    focus: focus?.(element, context),
    payload: payload?.(element, context),
    satisfied: false,
  };
};

export const runValidations = (
  documentContent: readonly Fragment[],
  validations: readonly Validation[],
  options: Required<LocaleOptions> & ValidatorRunOptions,
): Violation[] => {
  const { severities } = options;
  const applicable = validations.filter(({ severity }) => severities === undefined || severities.includes(severity));
  const documentContext = new DocumentContext(documentContent);

  return matchingElements(documentContent, '*').flatMap((element) =>
    applicable
      .filter(({ selector }) => element.matches(selector))
      .flatMap((validation): Violation[] => {
        const { correction, focus, payload, satisfied } = validateElement(validation, element, documentContext);
        if (satisfied) return [];

        const { messages, rule, scope, severity } = validation;
        const { fallbackLocale, locale } = options;

        return [
          {
            element,
            focus,
            messages: resolveMessages(messages, locale, fallbackLocale, payload),
            rule,
            scope,
            severity,
            ...(correction === undefined ? {} : { correction: localiseCorrection(correction, locale, fallbackLocale) }),
            ...(payload === undefined ? {} : { payload }),
          },
        ];
      }),
  );
};
