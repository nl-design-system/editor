import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';

export type DocumentValidator = (editor: Editor, settings: EditorSettings) => ValidationResult[];

export type ContentValidator = (editor: Editor, node: Node, pos: number) => ValidationResult | null;

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
