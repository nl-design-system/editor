import { describe, expect, it } from 'vitest';
import type { PageViolation } from '../types';
import { hasChanges } from './hasChanges';

const violation = (overrides: Partial<PageViolation> = {}): PageViolation => ({
  element: document.createElement('p'),
  messages: { error: 'Lege alinea' },
  rule: 'paragraph-should-not-be-empty',
  scope: 'element',
  severity: 'warning',
  source: 'clippy-source-1',
  ...overrides,
});

describe('hasChanges', () => {
  it('reports no changes for the same violations found again', () => {
    const element = document.createElement('p');

    expect(hasChanges([violation({ element })], [violation({ correct: () => undefined, element })])).toBe(false);
  });

  it('reports no changes between two empty results', () => {
    expect(hasChanges([], [])).toBe(false);
  });

  it('reports a change when a violation is added or removed', () => {
    const current = violation();

    expect(hasChanges([current], [current, violation()])).toBe(true);
    expect(hasChanges([current, violation()], [current])).toBe(true);
  });

  it('reports a change when a violation points at another element', () => {
    expect(hasChanges([violation()], [violation()])).toBe(true);
  });

  it.each([
    ['rule', { rule: 'heading-must-not-be-empty' }],
    ['source', { source: 'clippy-source-2' }],
    ['severity', { severity: 'error' }],
  ] as const)('reports a change when the %s differs', (_, override) => {
    const element = document.createElement('p');

    expect(hasChanges([violation({ element })], [violation({ element, ...override })])).toBe(true);
  });

  it('reports a change when the order of the violations differs', () => {
    const [first, second] = [violation(), violation()];

    expect(hasChanges([first, second], [second, first])).toBe(true);
  });

  it('compares payloads by their values', () => {
    const element = document.createElement('h4');
    const found = (payload?: PageViolation['payload']) => violation({ element, ...(payload && { payload }) });

    expect(hasChanges([found({ headingLevel: 4 })], [found({ headingLevel: 4 })])).toBe(false);
    expect(hasChanges([found({ headingLevel: 4 })], [found({ headingLevel: 3 })])).toBe(true);
    expect(hasChanges([found({ headingLevel: 4 })], [found({ expectedHeadingLevel: 2, headingLevel: 4 })])).toBe(true);
    expect(hasChanges([found()], [found({ headingLevel: 4 })])).toBe(true);
  });
});
