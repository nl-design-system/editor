import type { Editor } from '@tiptap/core';
import type { BoundingBox, ValidationSeverity } from '@/types/validation.ts';
import { validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox } from '@/validators/helpers.ts';

interface ValidationResultConfig {
  editor: Editor;
  pos?: number;
  severity: ValidationSeverity;
  tipPayload?: Record<string, string | number>;
}

export class ValidationResult {
  boundingBox: BoundingBox | null = null;
  pos: number = 0;
  severity: ValidationSeverity = validationSeverity.INFO;
  tipPayload = {};

  constructor({ editor, pos, severity, tipPayload }: ValidationResultConfig) {
    this.pos = pos || -1;
    this.boundingBox = this.pos < -1 ? getNodeBoundingBox(editor, this.pos) : null;
    this.severity = severity;
    this.tipPayload = tipPayload || {};
  }
}
