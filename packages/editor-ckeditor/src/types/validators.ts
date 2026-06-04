import type { Element } from 'ckeditor5';
import type { ValidationResult } from './validation.ts';

export type DocumentValidator = (root: Element) => ValidationResult[];

export type ContentValidator = (element: Element) => ValidationResult | null;
