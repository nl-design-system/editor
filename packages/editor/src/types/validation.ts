import type { Editor } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';

/**
 * A validator that operates on the full document represented as an HTML string
 * or an HTMLElement. Use this type when writing validators that are independent
 * of any editor framework.
 *
 * @param content - The document HTML to validate, either as a raw string or a
 *   live HTMLElement (e.g. the editor's container element).
 * @param settings - Editor configuration used during validation.
 * @returns An array of {@link ValidationResult} objects describing the issues
 *   found in the document.
 */
export type DocumentValidator = (content: string | HTMLElement, settings: EditorSettings) => ValidationResult[];

/**
 * A validator that operates on a single element within the document.
 *
 * @param content - The full document HTML to provide context, either as a raw
 *   string or a live HTMLElement.
 * @param node - The specific DOM Element currently being validated.
 * @param pos - The zero-based index of `node` among the elements visited
 *   during a depth-first traversal of `content`. Useful for stable map keys.
 * @returns A single {@link ValidationResult} when an issue is detected, or
 *   `null` when the element passes validation.
 */
export type ContentValidator = (content: string | HTMLElement, node: Element, pos: number) => ValidationResult | null;

export type ValidationEntry = readonly [key: string, value: ValidationResult];

export type CorrectValidationFunction = (editor: Editor) => void;

export type ValidationResult = {
  range?: Range;
  scope: 'element' | 'inline';
  severity: ValidationSeverity;
  tipPayload?: Record<string, number | string | boolean>;
  correct?: CorrectValidationFunction;
};

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationsMap = Map<string, ValidationResult>;
