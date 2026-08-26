import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import { correctConvertToList, correctEntirelyBoldParagraph, correctHeadingResemblingParagraph } from './corrector';

afterEach(unmountAll);

describe('correctEntirelyBoldParagraph', () => {
  it('unwraps the bold marks but keeps the text', () => {
    const root = mount('<p><strong>All bold</strong></p>');
    correctEntirelyBoldParagraph(root.querySelector('p')!)();
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('p')!.textContent).toBe('All bold');
  });
});

describe('correctConvertToList', () => {
  it('converts <br>-separated lines to an unordered list', () => {
    const root = mount('<p>- one<br>- two<br>- three</p>');
    correctConvertToList(root.querySelector('p')!, false)();
    const ul = root.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul!.querySelectorAll('li')).toHaveLength(3);
    expect(ul!.querySelector('li')!.textContent).toBe('one');
  });

  it('converts sibling ordered paragraphs to an ordered list', () => {
    const root = mount('<p>1. one</p><p>2. two</p>');
    correctConvertToList(root.querySelector('p')!, true)();
    const ol = root.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
  });
});

describe('correctHeadingResemblingParagraph', () => {
  it('converts to a heading one level below the preceding one', () => {
    const root = mount('<h2>Section</h2><p><strong>Looks like a heading</strong></p>');
    const para = root.querySelector('p')!;
    correctHeadingResemblingParagraph(para, 'Looks like a heading')();
    expect(root.querySelector('h3')!.textContent).toBe('Looks like a heading');
  });

  it('defaults to h2 without a preceding heading', () => {
    const root = mount('<p><strong>Standalone</strong></p>');
    correctHeadingResemblingParagraph(root.querySelector('p')!, 'Standalone')();
    expect(root.querySelector('h2')!.textContent).toBe('Standalone');
  });
});
