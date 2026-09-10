import type { Violation } from '@/types/validation';

/**
 * Builds a {@link Violation} for tests, filling in the fields every violation carries so a fixture
 * only has to name what the test is about.
 */
export const violation = (overrides: Partial<Violation> = {}): Violation => ({
  element: document.createElement('p'),
  messages: { error: 'Deze alinea is leeg.' },
  rule: 'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
  scope: 'element',
  severity: 'error',
  ...overrides,
});

/**
 * Builds a {@link Violation} that sits on an inline element, which the editor paints as a run of
 * text rather than marking as a whole block.
 */
export const inlineViolation = (overrides: Partial<Violation> = {}): Violation =>
  violation({
    element: document.createElement('a'),
    messages: { error: 'Deze link is leeg.' },
    rule: 'LINK_SHOULD_NOT_BE_EMPTY',
    ...overrides,
  });
