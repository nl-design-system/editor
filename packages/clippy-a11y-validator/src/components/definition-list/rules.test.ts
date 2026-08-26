import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { hasOnlyEmptyTerms, isEmptyTermWithDescription } from './rules';

describe('isEmptyTermWithDescription', () => {
  it('flags an empty term whose description is filled in', () => {
    expect(isEmptyTermWithDescription(parseAndSelect('<dl><dt></dt><dd>meaning</dd></dl>', 'dt'))).toBe(true);
  });

  it('accepts a term that has a label', () => {
    expect(isEmptyTermWithDescription(parseAndSelect('<dl><dt>word</dt><dd>meaning</dd></dl>', 'dt'))).toBe(false);
  });

  it('accepts an empty term next to an empty description', () => {
    expect(isEmptyTermWithDescription(parseAndSelect('<dl><dt></dt><dd> </dd></dl>', 'dt'))).toBe(false);
  });

  it('accepts an empty term not followed by a description', () => {
    expect(isEmptyTermWithDescription(parseAndSelect('<dl><dt></dt><dt>word</dt></dl>', 'dt'))).toBe(false);
  });

  it('ignores a non-term', () => {
    expect(isEmptyTermWithDescription(parseAndSelect('<dl><dd></dd></dl>', 'dd'))).toBe(false);
  });
});

describe('hasOnlyEmptyTerms', () => {
  it('flags a list where no term is filled in', () => {
    expect(hasOnlyEmptyTerms(parseAndSelect('<dl><dt></dt><dd>a</dd><dt> </dt><dd>b</dd></dl>', 'dl'))).toBe(true);
  });

  it('accepts a list with at least one filled term', () => {
    expect(hasOnlyEmptyTerms(parseAndSelect('<dl><dt></dt><dd>a</dd><dt>word</dt><dd>b</dd></dl>', 'dl'))).toBe(false);
  });

  it('accepts a list with no terms at all', () => {
    expect(hasOnlyEmptyTerms(parseAndSelect('<dl><dd>orphan</dd></dl>', 'dl'))).toBe(false);
  });

  it('judges only its own terms, not a nested list’s', () => {
    const nested = '<dl id="outer"><dt>word</dt><dd><dl><dt></dt><dd>a</dd></dl></dd></dl>';

    expect(hasOnlyEmptyTerms(parseAndSelect(nested, '#outer'))).toBe(false);
  });

  it('ignores a non-list', () => {
    expect(hasOnlyEmptyTerms(parseAndSelect('<div><dt></dt></div>', 'div'))).toBe(false);
  });
});
