import { describe, expect, it } from 'vitest';
import { headingValidations } from '@/constants';
import { buildValidationMap } from '@/validation-map';

const ALL = { enableRules: ['*'] };

/** Parse HTML into a detached body and build the Range-keyed validation map. */
const build = (html: string) => buildValidationMap(new DOMParser().parseFromString(html, 'text/html').body, ALL);

describe('buildValidationMap', () => {
  it('returns a Range-keyed map with severity, validatorKey and a correction attached', () => {
    const map = build('<h1></h1>');

    expect(map.size).toBe(1);
    const [range, entry] = [...map.entries()][0];
    expect(range).toBeInstanceOf(Range);
    expect(entry.range).toBe(range);
    expect(entry.validatorKey).toBe(headingValidations.HEADING_MUST_NOT_BE_EMPTY);
    expect(entry.severity).toBe('error');
    expect(entry.correct).toBeTypeOf('function');
  });

  it('produces a working correction (removing the empty heading)', () => {
    const body = new DOMParser().parseFromString('<h1></h1>', 'text/html').body;
    const entry = [...buildValidationMap(body, ALL).values()][0];

    entry.correct!();
    expect(body.querySelector('h1')).toBeNull();
  });

  it('returns an empty map for accessible content', () => {
    expect(build('<h1>Title</h1><p>Body text</p>').size).toBe(0);
  });
});
