import { parse, parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import {
  findHeadingOrderOffenses,
  findMisplacedTopLevelHeading,
  findRepeatedHeadingOnes,
  hasFormattingInsideHeading,
  headingLevelOf,
  isEmptyHeading,
  isHeading,
} from './rules';

describe('isHeading', () => {
  it.each(['h1', 'h2', 'h6'])('recognises <%s>', (tag) => {
    expect(isHeading(parseAndSelect(`<${tag}>t</${tag}>`, tag))).toBe(true);
  });

  it.each(['p', 'div', 'span'])('rejects <%s>', (tag) => {
    expect(isHeading(parseAndSelect(`<${tag}>t</${tag}>`, tag))).toBe(false);
  });
});

describe('headingLevelOf', () => {
  it('reads the level off the tag name', () => {
    expect(headingLevelOf(parseAndSelect('<h4>t</h4>', 'h4'))).toBe(4);
  });
});

describe('isEmptyHeading', () => {
  it('flags a heading with no content', () => {
    expect(isEmptyHeading(parseAndSelect('<h1></h1>', 'h1'))).toBe(true);
  });

  it('flags a heading holding only whitespace', () => {
    expect(isEmptyHeading(parseAndSelect('<h2>   </h2>', 'h2'))).toBe(true);
  });

  it('accepts a heading with text', () => {
    expect(isEmptyHeading(parseAndSelect('<h1>Title</h1>', 'h1'))).toBe(false);
  });

  it('ignores an empty non-heading', () => {
    expect(isEmptyHeading(parseAndSelect('<p></p>', 'p'))).toBe(false);
  });
});

describe('hasFormattingInsideHeading', () => {
  it.each(['strong', 'b', 'em', 'i'])('flags a heading wrapping <%s>', (tag) => {
    expect(hasFormattingInsideHeading(parseAndSelect(`<h2>a <${tag}>b</${tag}></h2>`, 'h2'))).toBe(true);
  });

  it('accepts a plain heading', () => {
    expect(hasFormattingInsideHeading(parseAndSelect('<h2>Plain title</h2>', 'h2'))).toBe(false);
  });

  it('ignores formatting outside a heading', () => {
    expect(hasFormattingInsideHeading(parseAndSelect('<p><strong>bold</strong></p>', 'p'))).toBe(false);
  });
});

describe('findHeadingOrderOffenses', () => {
  it('accepts a consecutive outline', () => {
    expect(findHeadingOrderOffenses(parse('<h1>a</h1><h2>b</h2><h3>c</h3>'))).toStrictEqual([]);
  });

  it('accepts jumping back up to a shallower level', () => {
    expect(findHeadingOrderOffenses(parse('<h1>a</h1><h2>b</h2><h3>c</h3><h2>d</h2>'))).toStrictEqual([]);
  });

  it('reports a skipped level with the level it should carry', () => {
    const [offense, ...rest] = findHeadingOrderOffenses(parse('<h1>a</h1><h3>b</h3>'));

    expect(rest).toStrictEqual([]);
    expect(offense).toMatchObject({
      headingLevel: 3,
      precedingHeadingLevel: 1,
      problem: 'skipped-level',
      targetLevel: 2,
    });
    expect(offense.heading.tagName).toBe('H3');
  });

  it('reports a heading above the configured top level', () => {
    const [offense] = findHeadingOrderOffenses(parse('<h1>a</h1>'), 2);

    expect(offense).toMatchObject({ headingLevel: 1, problem: 'above-top-level', targetLevel: 2 });
  });

  it('reports both problems when one heading breaks both rules', () => {
    // Top level 3, so <h1> is too shallow; the preceding level starts at 3, so <h6> also skips.
    const problems = findHeadingOrderOffenses(parse('<h1>a</h1><h6>b</h6>'), 3).map((offense) => offense.problem);

    expect(problems).toStrictEqual(['above-top-level', 'skipped-level']);
  });

  it('measures the first heading against the configured top level', () => {
    expect(findHeadingOrderOffenses(parse('<h2>a</h2><h3>b</h3>'), 2)).toStrictEqual([]);
  });

  it('finds nothing in content without headings', () => {
    expect(findHeadingOrderOffenses(parse('<p>just prose</p>'))).toStrictEqual([]);
  });
});

describe('findRepeatedHeadingOnes', () => {
  it('returns every h1 after the first', () => {
    const repeated = findRepeatedHeadingOnes(parse('<h1>a</h1><h1>b</h1><h1>c</h1>'));

    expect(repeated.map((h1) => h1.textContent)).toStrictEqual(['b', 'c']);
  });

  it('accepts a single h1', () => {
    expect(findRepeatedHeadingOnes(parse('<h1>a</h1><h2>b</h2>'))).toStrictEqual([]);
  });

  it('accepts content with no h1', () => {
    expect(findRepeatedHeadingOnes(parse('<h2>a</h2>'))).toStrictEqual([]);
  });
});

describe('findMisplacedTopLevelHeading', () => {
  it('accepts content opening with an h1', () => {
    expect(findMisplacedTopLevelHeading(parse('<h1>a</h1><p>b</p>'))).toBeNull();
  });

  it('returns the first element when it is not an h1', () => {
    expect(findMisplacedTopLevelHeading(parse('<h2>a</h2>'))?.tagName).toBe('H2');
  });

  it('falls back to the root when the content is empty', () => {
    const root = parse('');

    expect(findMisplacedTopLevelHeading(root)).toBe(root);
  });

  it('exempts content nested under a higher top heading level', () => {
    expect(findMisplacedTopLevelHeading(parse('<h2>a</h2>'), 2)).toBeNull();
  });
});
