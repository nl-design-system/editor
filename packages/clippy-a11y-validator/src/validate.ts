import type { ValidationResult } from './types.ts';
import { paragraphValidators } from './nlds-components/paragraph';

const bindValidatorsToTag =
  <TTag extends keyof HTMLElementTagNameMap>(
    tag: TTag,
    validators: ((element: HTMLElementTagNameMap[TTag]) => ValidationResult | null)[],
  ) =>
  (root: ParentNode): ValidationResult[] =>
    [...root.querySelectorAll(tag)].flatMap((element) =>
      validators.map((validate) => validate(element)).filter((result) => result !== null),
    );

const validators = [bindValidatorsToTag('p', paragraphValidators)];

export const validate = (root: ParentNode): ValidationResult[] => validators.flatMap((validate) => validate(root));
