import { describe, it, expect } from 'vitest';
import { isKeyOf } from './helpers';

describe('isKeyOf', () => {
  it('returns a function', async () => {
    const tester = isKeyOf({ a: true });

    expect(tester).toBeTypeOf('function');
  });

  it('returns true when object has this key', async () => {
    const tester = isKeyOf({ a: true });

    expect(tester('a')).toBe(true);
  });

  it('returns false when object does not have this key', async () => {
    const tester = isKeyOf({ a: true });

    expect(tester('b')).toBe(false);
  });
});
