import type { CorrectValidationFunction } from '../../../types.ts';
import { unwrapElement } from '../../../helpers.ts';
import { BOLD_SELECTOR } from '../rules.ts';

export const correctEntirelyBoldParagraph =
  (paragraph: HTMLElement): CorrectValidationFunction =>
  () => {
    paragraph.querySelectorAll(BOLD_SELECTOR).forEach(unwrapElement);
  };
