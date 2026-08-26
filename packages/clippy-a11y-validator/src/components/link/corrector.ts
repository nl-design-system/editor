import type { CorrectValidationFunction } from '@/types';
import { selectElement } from '@/dom';

// Select the generic link text so the user can rewrite it.
export const correctGenericLinkText =
  (link: Element): CorrectValidationFunction =>
  () => {
    selectElement(link);
  };
