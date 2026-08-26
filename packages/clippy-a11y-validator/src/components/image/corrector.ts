import type { CorrectValidationFunction, ImageAltTextRequest } from '@/types';
import { validatorEvents } from '@/constants';
import { selectElement } from '@/dom';

// Select the image, then dispatch a generic global event so a host can open its
// alt-text UI (prefilled src). No direct host reference needed.
export const correctImageMissingAltText =
  (node: HTMLImageElement): CorrectValidationFunction =>
  () => {
    selectElement(node);
    const request: ImageAltTextRequest = { files: [{ name: node.alt, type: 'image/*', url: node.src }], replace: true };
    globalThis.dispatchEvent(new CustomEvent(validatorEvents.OPEN_IMAGE_DIALOG, { detail: request }));
  };
