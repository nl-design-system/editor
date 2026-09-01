import type { ValidationResult } from './types.ts';
import { paragraphValidators } from './nlds-components/paragraph';

type HTMLElementValidators = (element: Element) => ValidationResult[];

const bindValidatorsToTag = <TTag extends keyof HTMLElementTagNameMap>(
  tag: TTag,
  validators: ((element: HTMLElementTagNameMap[TTag]) => ValidationResult | null)[],
): [string, HTMLElementValidators] => [
  tag.toUpperCase(),
  (element) =>
    validators.map((validate) => validate(element as HTMLElementTagNameMap[TTag])).filter((result) => result !== null),
];

const validatorRegistry = new Map<string, HTMLElementValidators>([bindValidatorsToTag('p', paragraphValidators)]);

export const validate = (root: ParentNode): ValidationResult[] => {
  return [...root.querySelectorAll('*')].flatMap((element) => {
    const validator = validatorRegistry.get(element.tagName);
    if (validator) {
      return validator(element);
    }
    return [];
  });
};
