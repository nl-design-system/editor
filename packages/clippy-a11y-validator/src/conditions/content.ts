import type { ValidationCondition } from '../types/validation.ts';
import { isEmptyOrWhitespace } from '../utils/text.ts';

export const hasTextContent: ValidationCondition = (element) => !isEmptyOrWhitespace(element.textContent ?? '');
