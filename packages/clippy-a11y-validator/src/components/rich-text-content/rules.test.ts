import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { emptyBlockNodeType, emptyInlineType, isUnderlined } from './rules';

describe('emptyBlockNodeType', () => {
  it.each([
    ['<p></p>', 'p', 'paragraph'],
    ['<ul><li></li></ul>', 'li', 'listItem'],
    ['<table><tr><td></td></tr></table>', 'td', 'tableCell'],
    ['<table><tr><th></th></tr></table>', 'th', 'tableHeader'],
    ['<table><caption></caption></table>', 'caption', 'tableCaption'],
    ['<dl><dt></dt></dl>', 'dt', 'definitionTerm'],
    ['<dl><dd></dd></dl>', 'dd', 'definitionDescription'],
  ])('maps an empty %s to %s', (html, selector, nodeType) => {
    expect(emptyBlockNodeType(parseAndSelect(html, selector))).toBe(nodeType);
  });

  it('treats a whitespace-only block as empty', () => {
    expect(emptyBlockNodeType(parseAndSelect('<p>  </p>', 'p'))).toBe('paragraph');
  });

  it('returns null for a block holding text', () => {
    expect(emptyBlockNodeType(parseAndSelect('<p>text</p>', 'p'))).toBeNull();
  });

  it('returns null for a tag it does not map', () => {
    expect(emptyBlockNodeType(parseAndSelect('<div></div>', 'div'))).toBeNull();
  });
});

describe('emptyInlineType', () => {
  it.each([
    ['b', 'bold'],
    ['strong', 'bold'],
    ['em', 'italic'],
    ['i', 'italic'],
    ['u', 'underline'],
    ['s', 'strike'],
    ['del', 'strike'],
    ['code', 'code'],
    ['mark', 'highlight'],
  ])('maps an empty <%s> to %s', (tag, inlineType) => {
    expect(emptyInlineType(parseAndSelect(`<p><${tag}></${tag}></p>`, tag))).toBe(inlineType);
  });

  it('maps an empty link', () => {
    expect(emptyInlineType(parseAndSelect('<p><a href="/x"></a></p>', 'a'))).toBe('link');
  });

  it('returns null for inline markup holding text', () => {
    expect(emptyInlineType(parseAndSelect('<p><b>bold</b></p>', 'b'))).toBeNull();
  });

  it('returns null for a tag it does not map', () => {
    expect(emptyInlineType(parseAndSelect('<p><span></span></p>', 'span'))).toBeNull();
  });
});

describe('isUnderlined', () => {
  it('flags an underline element', () => {
    expect(isUnderlined(parseAndSelect('<p><u>text</u></p>', 'u'))).toBe(true);
  });

  it('accepts other inline markup', () => {
    expect(isUnderlined(parseAndSelect('<p><em>text</em></p>', 'em'))).toBe(false);
  });
});
