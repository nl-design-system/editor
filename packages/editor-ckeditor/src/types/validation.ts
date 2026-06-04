import type { Element } from 'ckeditor5';

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type BoundingBox = { top: number; height: number };

export type ValidationResult = {
  boundingBox: BoundingBox | null;
  element: Element;
  ruleId: string;
  severity: ValidationSeverity;
};
