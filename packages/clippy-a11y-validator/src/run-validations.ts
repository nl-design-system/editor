import type { Fragment } from './types/fragment.ts';
import type { ByLocale } from './types/messages.ts';
import type { Validation, Violation } from './types/validation.ts';
import type { LocaleOptions, ValidatorRunOptions } from './types/validator.ts';
import { matchingElements, DocumentContext } from './document-context.ts';
import { resolveLocalised, resolveMessages } from './messages.ts';

/** A correction's label, resolved for the run's locale. Absent when the rule names none. */
const localisedLabel = (label: ByLocale<string> | undefined, { fallbackLocale, locale }: Required<LocaleOptions>) =>
  label === undefined ? {} : { label: resolveLocalised(label, locale, fallbackLocale) };

/**
 * Runs one validation against one element, producing the parts of a violation that depend on that
 * element. `undefined` when the element satisfies the validation.
 */
const validateElement = (
  validation: Validation,
  element: HTMLElement,
  documentContext: DocumentContext,
  locales: Required<LocaleOptions>,
): Pick<Violation, 'corrections' | 'focus' | 'payload'> | undefined => {
  if (validation.scope === 'element') {
    const { condition, corrections, focus, payload } = validation;
    if (condition(element)) return undefined;

    return {
      corrections: corrections?.map(({ execute, label }) => ({
        execute: execute(element, documentContext.for(element)),
        ...localisedLabel(label, locales),
      })),
      focus: focus?.(element),
      payload: payload?.(element),
    };
  }

  const { condition, corrections, focus, payload } = validation;
  const context = documentContext.for(element);
  if (condition(element, context)) return undefined;

  return {
    corrections: corrections?.map(({ execute, label }) => ({
      execute: execute(element, context),
      ...localisedLabel(label, locales),
    })),
    focus: focus?.(element, context),
    payload: payload?.(element, context),
  };
};

/** One validation against one element, as a violation — or `undefined` when the element passes. */
const toViolation = (
  validation: Validation,
  element: HTMLElement,
  documentContext: DocumentContext,
  locales: Required<LocaleOptions>,
): Violation | undefined => {
  const found = validateElement(validation, element, documentContext, locales);
  if (!found) return undefined;

  const { corrections, focus, payload } = found;
  const { documentationId, messages, rule, scope, severity } = validation;

  return {
    element,
    focus,
    messages: resolveMessages(messages, locales.locale, locales.fallbackLocale, payload, documentationId),
    rule,
    scope,
    severity,
    ...(corrections === undefined || corrections.length === 0 ? {} : { corrections }),
    ...(payload === undefined ? {} : { payload }),
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
      .flatMap((validation) => toViolation(validation, element, documentContext, options) ?? []),
  );
};
