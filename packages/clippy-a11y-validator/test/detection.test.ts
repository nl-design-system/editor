import { describe, expect, it } from 'vitest';
import type { ValidationResult } from '@/types';
import { blockValidations, inlineValidations } from '@/constants';
import { runValidation } from '@/validators';
import {
  documentMustHaveCorrectHeadingOrder,
  documentMustHaveSingleHeadingOne,
  documentMustHaveTopLevelHeadingOne,
} from '@/validators/document';

const ALL: { enableRules: string[] } = { enableRules: ['*'] };

/** Parse HTML into a detached body and run all validators against it. */
const detect = (html: string, settings = ALL): ValidationResult[] => {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  return runValidation(body, settings);
};

const keys = (html: string): string[] => detect(html).map((r) => r.validatorKey!);
const first = (html: string, key: string): ValidationResult | undefined =>
  detect(html).find((r) => r.validatorKey === key);

describe('block detection', () => {
  it('flags an empty heading', () => {
    expect(keys('<h1></h1>')).toContain(blockValidations.HEADING_MUST_NOT_BE_EMPTY);
  });

  it('flags a heading containing bold or italic', () => {
    expect(keys('<h2>Title <strong>bold</strong></h2>')).toContain(
      blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC,
    );
  });

  it('flags an image without alt text but not one with alt text', () => {
    expect(keys('<p>x</p><img src="a.png">')).toContain(blockValidations.IMAGE_MUST_HAVE_ALT_TEXT);
    expect(keys('<p>x</p><img src="a.png" alt="a cat">')).not.toContain(blockValidations.IMAGE_MUST_HAVE_ALT_TEXT);
  });

  it('flags an empty block node with its node type', () => {
    const result = first(
      '<table><tr><td></td><td>x</td></tr><tr><td>y</td><td>z</td></tr></table>',
      blockValidations.NODE_SHOULD_NOT_BE_EMPTY,
    );
    expect(result).toBeDefined();
    expect(result!.tipPayload?.['nodeType']).toBe('tableCell');
  });

  it('flags a fully-bold short paragraph resembling a heading', () => {
    expect(keys('<p><strong>Looks like a heading</strong></p>')).toContain(
      blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
    );
  });

  it('flags an ordered list-like paragraph and records the order in tipPayload', () => {
    const result = first('<p>1. one<br>2. two</p>', blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST);
    expect(result).toBeDefined();
    expect(result!.tipPayload?.['isOrdered']).toBe(true);
  });

  it('flags list-like sibling paragraphs', () => {
    expect(keys('<p>- one</p><p>- two</p>')).toContain(blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST);
  });

  it('flags a table without headings', () => {
    expect(keys('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>')).toContain(
      blockValidations.TABLE_MUST_HAVE_HEADINGS,
    );
  });

  it('does not flag a table with a header row', () => {
    expect(keys('<table><tr><th>a</th><th>b</th></tr><tr><td>c</td><td>d</td></tr></table>')).not.toContain(
      blockValidations.TABLE_MUST_HAVE_HEADINGS,
    );
  });

  it('flags a table with a single row', () => {
    expect(keys('<table><tr><th>a</th><th>b</th></tr></table>')).toContain(
      blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS,
    );
  });

  it('flags a definition list without a term', () => {
    expect(keys('<dl><dt></dt><dd>description</dd></dl>')).toContain(
      blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM,
    );
  });

  it('flags an empty definition term that has a following description', () => {
    expect(keys('<dl><dt></dt><dd>description</dd></dl>')).toContain(
      blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM,
    );
  });
});

describe('inline detection', () => {
  it.each([
    ['<b>&nbsp;</b>', 'bold'],
    ['<i>&nbsp;</i>', 'italic'],
    ['<s>&nbsp;</s>', 'strike'],
    ['<u>&nbsp;</u>', 'underline'],
    ['<mark>&nbsp;</mark>', 'highlight'],
    ['<code>&nbsp;</code>', 'code'],
    ['<a href="#">&nbsp;</a>', 'link'],
  ])('flags empty inline %s as %s', (html, nodeType) => {
    const result = first(`<p>text ${html}</p>`, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY);
    expect(result?.tipPayload?.['nodeType']).toBe(nodeType);
  });

  it('does not flag inline elements with text', () => {
    expect(keys('<p>text <b>bold</b></p>')).not.toContain(inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY);
  });

  it('flags an underlined element', () => {
    expect(keys('<p>text <u>underlined</u></p>')).toContain(inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED);
  });

  it.each(['Lees meer', 'Klik hier', 'LEES MEER'])('flags generic link text "%s"', (text) => {
    expect(keys(`<p><a href="https://example.com">${text}</a></p>`)).toContain(
      inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC,
    );
  });

  it('does not flag descriptive link text', () => {
    expect(keys('<p><a href="https://example.com">Read the annual report</a></p>')).not.toContain(
      inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC,
    );
  });
});

describe('document detection', () => {
  it('returns no error for a correct heading order', () => {
    const body = new DOMParser().parseFromString('<h1>a</h1><h2>b</h2>', 'text/html').body;
    expect(documentMustHaveCorrectHeadingOrder(body)).toStrictEqual([]);
  });

  it('returns a warning with targetLevel for a skipped level', () => {
    const body = new DOMParser().parseFromString('<h1>a</h1><h3>b</h3>', 'text/html').body;
    const [result] = documentMustHaveCorrectHeadingOrder(body);
    expect(result.severity).toBe('warning');
    expect(result.tipPayload).toMatchObject({ headingLevel: 3, precedingHeadingLevel: 1, targetLevel: 2 });
  });

  it('returns an error when a heading is below topHeadingLevel', () => {
    const body = new DOMParser().parseFromString('<h1>a</h1><h2>b</h2>', 'text/html').body;
    const results = documentMustHaveCorrectHeadingOrder(body, { enableRules: ['*'], topHeadingLevel: 2 });
    expect(results[0].severity).toBe('error');
    expect(results[0].tipPayload).toMatchObject({ targetLevel: 2, topHeadingLevel: 2 });
  });

  it('detects duplicate heading ones', () => {
    const body = new DOMParser().parseFromString('<h1>a</h1><h1>b</h1><h1>c</h1>', 'text/html').body;
    expect(documentMustHaveSingleHeadingOne(body)).toHaveLength(2);
  });

  it('flags a document not starting with an h1', () => {
    const body = new DOMParser().parseFromString('<h2>a</h2>', 'text/html').body;
    expect(documentMustHaveTopLevelHeadingOne(body)).toHaveLength(1);
  });

  it('does not flag when topHeadingLevel is not 1', () => {
    const body = new DOMParser().parseFromString('<h2>a</h2>', 'text/html').body;
    expect(documentMustHaveTopLevelHeadingOne(body, { enableRules: ['*'], topHeadingLevel: 2 })).toStrictEqual([]);
  });
});
