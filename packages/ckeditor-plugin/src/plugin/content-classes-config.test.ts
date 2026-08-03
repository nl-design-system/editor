import { contentClasses } from '@nl-design-system-community/editor/content-classes';
import { describe, expect, it } from 'vitest';
import {
  CONTENT_CLASS_FIELDS,
  HEADING_LEVEL_TOKEN,
  contentClassNames,
  resolveContentClasses,
} from './content-classes-config.ts';

describe('CONTENT_CLASS_FIELDS', () => {
  it('has a unique key per field', () => {
    const keys = CONTENT_CLASS_FIELDS.map(({ key }) => key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('names at least one tag and a label per field', () => {
    for (const { key, label, tags } of CONTENT_CLASS_FIELDS) {
      expect(tags.length, key).toBeGreaterThan(0);
      expect(label, key).not.toBe('');
    }
  });

  it('keeps the level token in the heading default', () => {
    const heading = CONTENT_CLASS_FIELDS.find(({ key }) => key === 'heading');
    expect(heading?.defaultValue).toContain(HEADING_LEVEL_TOKEN);
  });

  // Only a class that lands on a heading can resolve the token.
  it('uses the level token only on fields rendered as a heading', () => {
    for (const { defaultValue, tags } of CONTENT_CLASS_FIELDS) {
      if (defaultValue.includes(HEADING_LEVEL_TOKEN)) {
        expect(tags.every((tag) => /^h[1-6]$/.test(tag))).toBe(true);
      }
    }
  });
});

describe('resolveContentClasses', () => {
  it('returns a value for every field when nothing is configured', () => {
    expect(Object.keys(resolveContentClasses())).toEqual(CONTENT_CLASS_FIELDS.map(({ key }) => key));
  });

  it('replaces a configured class', () => {
    expect(resolveContentClasses({ paragraph: 'my-paragraph' }).paragraph).toBe('my-paragraph');
  });

  it('keeps the defaults of the fields that are not configured', () => {
    expect(resolveContentClasses({ paragraph: 'my-paragraph' }).table).toBe(contentClasses.table);
  });

  // The whole point of `??` over `||`: empty means "render without a class", not "use the default".
  it('keeps an empty class instead of falling back to the default', () => {
    expect(resolveContentClasses({ paragraph: '' }).paragraph).toBe('');
  });

  it('falls back to the default for an explicitly undefined class', () => {
    expect(resolveContentClasses({ paragraph: undefined }).paragraph).toBe(contentClasses.paragraph);
  });
});

describe('contentClassNames', () => {
  it('splits a class list into separate names', () => {
    expect(contentClassNames('one two')).toEqual(['one', 'two']);
  });

  it('ignores surrounding and repeated whitespace', () => {
    expect(contentClassNames('  one   two  ')).toEqual(['one', 'two']);
  });

  it('returns nothing for an empty class', () => {
    expect(contentClassNames('')).toEqual([]);
    expect(contentClassNames('   ')).toEqual([]);
  });

  it('fills in the level of the rendered heading', () => {
    expect(contentClassNames(`nl-heading--level-${HEADING_LEVEL_TOKEN}`, 'h3')).toEqual(['nl-heading--level-3']);
  });

  it('fills in every occurrence of the token', () => {
    expect(contentClassNames(`a-${HEADING_LEVEL_TOKEN} b-${HEADING_LEVEL_TOKEN}`, 'h4')).toEqual(['a-4', 'b-4']);
  });

  // Substituting nothing would render as `nl-heading--level-`.
  it('returns nothing when the token cannot be resolved', () => {
    expect(contentClassNames(`nl-heading--level-${HEADING_LEVEL_TOKEN}`, 'p')).toEqual([]);
    expect(contentClassNames(`nl-heading--level-${HEADING_LEVEL_TOKEN}`)).toEqual([]);
  });

  it('takes a tag without a token at face value', () => {
    expect(contentClassNames('nl-paragraph', 'h2')).toEqual(['nl-paragraph']);
  });
});
