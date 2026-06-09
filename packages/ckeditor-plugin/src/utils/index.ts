import type { ValidationResult } from '@nl-design-system-community/editor/validators';

export const toResults = (resultMap: Map<Range, ValidationResult>): ValidationResult[] =>
  Array.from(resultMap.values());
