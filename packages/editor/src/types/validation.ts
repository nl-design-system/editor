import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';

export type BoundingBox = { top: number; height: number };

export type DocumentValidator = (editor: Editor) => ValidationResult | null;

export type ContentValidator = (editor: Editor, node: Node, pos: number) => ValidationResult | null;

export type ValidationResult = {
  boundingBox: BoundingBox | null;
  severity: ValidationSeverity;
  pos: number;
  tipPayload?: Record<string, number | string>;
};

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationsMap = Map<string, ValidationResult>;
