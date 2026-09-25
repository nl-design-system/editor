import type { ValidationCondition } from '../../types/validation.ts';
import { selectors } from '../../consts/selectors.ts';
import { hasTextContent } from '../../utils/content.ts';
import { hasAltText } from '../image/utils.ts';

/**
 * A link is named by its text, or — when it wraps an image instead of text — by that image's alt text.
 * An image-only link whose image describes the destination carries a perfectly good accessible name,
 * so it must not be reported as empty.
 */
export const hasLinkText: ValidationCondition = (link) =>
  hasTextContent(link) || [...link.querySelectorAll<HTMLImageElement>(selectors.IMAGE)].some(hasAltText);
