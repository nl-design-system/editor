import type { Violation } from '@/types/validation';

/**
 * Builds a {@link Violation} for tests, filling in the fields every violation carries so a fixture
 * only has to name what the test is about.
 */
export const violation = (overrides: Partial<Violation> = {}): Violation => ({
  element: document.createElement('p'),
  messages: { error: 'Deze alinea is leeg.' },
  rule: 'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
  scope: 'block',
  severity: 'error',
  ...overrides,
});
