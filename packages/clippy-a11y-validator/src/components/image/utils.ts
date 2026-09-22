import type { ValidationCondition } from '../../types/validation.ts';
import { isEmptyOrWhitespace } from '../../utils/text.ts';

export const hasAltText: ValidationCondition<HTMLImageElement> = (image) => !isEmptyOrWhitespace(image.alt);
