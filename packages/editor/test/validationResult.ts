import type { ValidationResult } from '@/types/validation';

/**
 * Builds a {@link ValidationResult} for tests, filling in the fields every violation carries so a
 * fixture only has to name what the test is about.
 */
export const validationResult = (overrides: Partial<ValidationResult> = {}): ValidationResult => ({
  element: document.createElement('p'),
  messages: { error: 'Deze alinea is leeg.' },
  rule: 'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
  scope: 'block',
  severity: 'error',
  ...overrides,
});
