import type { CorrectValidationFunction } from '@/types';
import { changeTagName, unwrapElement } from '@/dom';
import { FORMATTING_SELECTOR } from './rules';

export const correctEmptyHeading =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

// Strip bold/italic from a heading.
export const correctHeadingWithFormatting =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.querySelectorAll(FORMATTING_SELECTOR).forEach(unwrapElement);
  };

export const correctHeadingLevel =
  (heading: Element, targetLevel: number): CorrectValidationFunction =>
  () => {
    changeTagName(heading, `h${targetLevel}`);
  };

export const correctDuplicateHeadingOne =
  (h1: Element): CorrectValidationFunction =>
  () => {
    changeTagName(h1, 'h2');
  };

export const correctMissingTopLevelHeading =
  (target: Element): CorrectValidationFunction =>
  () => {
    changeTagName(target, 'h1');
  };
