import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { detectListLikeParagraph, isEntirelyBoldParagraph, isParagraph, resemblesHeading } from './rules';

const paragraph = (html: string): Element => parseAndSelect(html, 'p');

describe('isParagraph', () => {
  it('recognises a paragraph', () => {
    expect(isParagraph(paragraph('<p>text</p>'))).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isParagraph(parseAndSelect('<div>text</div>', 'div'))).toBe(false);
  });
});

describe('isEntirelyBoldParagraph', () => {
  it.each(['strong', 'b'])('flags a paragraph wholly wrapped in <%s>', (tag) => {
    expect(isEntirelyBoldParagraph(paragraph(`<p><${tag}>All bold</${tag}></p>`))).toBe(true);
  });

  it('flags a paragraph made of several bold runs', () => {
    expect(isEntirelyBoldParagraph(paragraph('<p><strong>one</strong><b>two</b></p>'))).toBe(true);
  });

  it('ignores whitespace-only text between the bold runs', () => {
    expect(isEntirelyBoldParagraph(paragraph('<p> <strong>one</strong>  <b>two</b> </p>'))).toBe(true);
  });

  it('accepts a paragraph mixing bold and plain text', () => {
    expect(isEntirelyBoldParagraph(paragraph('<p><strong>bold</strong> and plain</p>'))).toBe(false);
  });

  it('accepts a paragraph in another kind of emphasis', () => {
    expect(isEntirelyBoldParagraph(paragraph('<p><em>italic</em></p>'))).toBe(false);
  });

  it('ignores an empty paragraph', () => {
    expect(isEntirelyBoldParagraph(paragraph('<p>   </p>'))).toBe(false);
  });

  it('ignores a bold-wrapped non-paragraph', () => {
    expect(isEntirelyBoldParagraph(parseAndSelect('<div><strong>x</strong></div>', 'div'))).toBe(false);
  });
});

describe('resemblesHeading', () => {
  it('flags a short, fully-bold paragraph', () => {
    expect(resemblesHeading(paragraph('<p><strong>Section title</strong></p>'))).toBe(true);
  });

  it('accepts a long bold paragraph as body copy', () => {
    const long = 'x'.repeat(61);

    expect(resemblesHeading(paragraph(`<p><strong>${long}</strong></p>`))).toBe(false);
  });

  it('accepts bold text at exactly the length limit', () => {
    const atLimit = 'x'.repeat(60);

    expect(resemblesHeading(paragraph(`<p><strong>${atLimit}</strong></p>`))).toBe(true);
  });

  it('accepts a short paragraph that is not bold', () => {
    expect(resemblesHeading(paragraph('<p>Short and plain</p>'))).toBe(false);
  });

  it('ignores an empty paragraph', () => {
    expect(resemblesHeading(paragraph('<p><strong> </strong></p>'))).toBe(false);
  });
});

describe('detectListLikeParagraph', () => {
  it('detects consecutive hand-numbered paragraphs', () => {
    expect(detectListLikeParagraph(paragraph('<p>1. one</p><p>2. two</p>'))).toStrictEqual({
      isOrdered: true,
      prefix: '1.',
    });
  });

  it('detects hand-bulleted lines split by <br>', () => {
    expect(detectListLikeParagraph(paragraph('<p>- one<br>- two</p>'))).toStrictEqual({
      isOrdered: false,
      prefix: '-',
    });
  });

  it('accepts a single numbered paragraph with nothing continuing it', () => {
    expect(detectListLikeParagraph(paragraph('<p>1. only one</p><p>prose</p>'))).toBeNull();
  });

  it('accepts prose with no list marker', () => {
    expect(detectListLikeParagraph(paragraph('<p>ordinary text<br>more text</p>'))).toBeNull();
  });

  it('ignores a non-paragraph', () => {
    expect(detectListLikeParagraph(parseAndSelect('<div>1. one<br>2. two</div>', 'div'))).toBeNull();
  });
});
