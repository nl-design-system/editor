import type { Node } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';

export type BoundingBox = { top: number; height: number };

export type DocumentValidator = (document: HTMLElement, settings: EditorSettings) => ValidationResult[];

export type ContentValidator = (document: HTMLElement, node: Node, pos: number) => ValidationResult | null;

export type ValidationEntry = readonly [key: string, value: ValidationResult];

export type ValidationResult = {
  boundingBox: BoundingBox | null;
  severity: ValidationSeverity;
  pos: number;
  tipPayload?: Record<string, number | string>;
};

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationsMap = Map<string, ValidationResult>;
