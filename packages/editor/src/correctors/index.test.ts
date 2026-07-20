import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomEvents } from '@/events';
import { getElementRange } from '@/validators/helpers';
import {
  correctConvertToList,
  correctDefinitionListMissingTerm,
  correctDefinitionTermMissingDescription,
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctEmptyMark,
  correctEmptyNode,
  correctGenericLinkText,
  correctHeadingLevel,
  correctHeadingResemblingParagraph,
  correctHeadingWithFormatting,
  correctImageMissingAltText,
  correctMissingTopLevelHeading,
  correctTableMissingHeadings,
  correctTableMissingRows,
  correctUnderlinedMark,
} from './index';

let container: HTMLElement | undefined;

/** Mount HTML in a contenteditable element attached to the document so selection/range APIs work. */
const mount = (html: string): HTMLElement => {
  container = document.createElement('div');
  container.contentEditable = 'true';
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

afterEach(() => {
  container?.remove();
  container = undefined;
});

describe('content correctors', () => {
  it('correctEmptyHeading removes the heading', () => {
    const root = mount('<h1></h1><p>body</p>');
    correctEmptyHeading(root.querySelector('h1')!)();
    expect(root.querySelector('h1')).toBeNull();
  });

  it('correctEmptyMark removes the mark element', () => {
    const root = mount('<p>text <b>&nbsp;</b></p>');
    correctEmptyMark(root.querySelector('b')!)();
    expect(root.querySelector('b')).toBeNull();
  });

  it('correctUnderlinedMark unwraps the underline but keeps its text', () => {
    const root = mount('<p>a <u>underlined</u> b</p>');
    correctUnderlinedMark(root.querySelector('u')!)();
    expect(root.querySelector('u')).toBeNull();
    expect(root.textContent).toContain('underlined');
  });

  it('correctHeadingWithFormatting removes bold and italic from the heading', () => {
    const root = mount('<h2>Title <strong>bold</strong> <em>italic</em></h2>');
    correctHeadingWithFormatting(root.querySelector('h2')!)();
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('em')).toBeNull();
    expect(root.querySelector('h2')!.textContent).toContain('bold');
  });

  it('correctEmptyNode removes a non-table node', () => {
    const root = mount('<p>keep</p><p></p>');
    const empty = root.querySelectorAll('p')[1];
    correctEmptyNode(empty, 'paragraph', getElementRange(empty))();
    expect(root.querySelectorAll('p')).toHaveLength(1);
  });

  it('correctEmptyNode keeps a table cell and selects it instead of removing', () => {
    const root = mount('<table><tr><td id="c"></td><td>x</td></tr></table>');
    const cell = root.querySelector('#c')!;
    correctEmptyNode(cell, 'tableCell', getElementRange(cell))();
    expect(root.querySelector('#c')).not.toBeNull();
  });

  it('correctImageMissingAltText dispatches the open-image-dialog event', () => {
    const root = mount('<p>x</p><img src="cat.png">');
    const img = root.querySelector('img') as HTMLImageElement;
    const listener = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, listener, { once: true });
    correctImageMissingAltText(img, getElementRange(img))();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('correctGenericLinkText selects the link range without throwing', () => {
    const root = mount('<p><a href="https://example.com">Lees meer</a></p>');
    const link = root.querySelector('a')!;
    expect(() => correctGenericLinkText(getElementRange(link))()).not.toThrow();
  });

  it('correctDefinitionListMissingTerm fills the empty term with a placeholder', () => {
    const root = mount('<dl><dt></dt><dd>description</dd></dl>');
    correctDefinitionListMissingTerm(root.querySelector('dl')!)();
    expect(root.querySelector('dt')!.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('correctDefinitionTermMissingDescription fills the term with a placeholder', () => {
    const root = mount('<dl><dt id="t"></dt><dd>description</dd></dl>');
    correctDefinitionTermMissingDescription(root.querySelector('#t')!)();
    expect(root.querySelector('#t')!.textContent?.trim().length).toBeGreaterThan(0);
  });
});

describe('list correctors', () => {
  it('correctConvertToList converts <br>-separated lines to an unordered list', () => {
    const root = mount('<p>- one<br>- two<br>- three</p>');
    correctConvertToList(root.querySelector('p')!, false)();
    const ul = root.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul!.querySelectorAll('li')).toHaveLength(3);
    expect(ul!.querySelector('li')!.textContent).toBe('one');
  });

  it('correctConvertToList converts sibling ordered paragraphs to an ordered list', () => {
    const root = mount('<p>1. one</p><p>2. two</p>');
    correctConvertToList(root.querySelector('p')!, true)();
    const ol = root.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
  });
});

describe('document correctors', () => {
  it('correctHeadingLevel changes the heading tag to the target level', () => {
    const root = mount('<h1>Title</h1><h3>Sub</h3>');
    correctHeadingLevel(root.querySelector('h3')!, 2)();
    expect(root.querySelector('h3')).toBeNull();
    expect(root.querySelector('h2')!.textContent).toBe('Sub');
  });

  it('correctDuplicateHeadingOne demotes an h1 to h2', () => {
    const root = mount('<h1>One</h1><h1 id="dup">Two</h1>');
    correctDuplicateHeadingOne(root.querySelector('#dup')!)();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('h2')!.textContent).toBe('Two');
  });

  it('correctMissingTopLevelHeading promotes the target to h1', () => {
    const root = mount('<h2>Title</h2>');
    correctMissingTopLevelHeading(root.querySelector('h2')!)();
    expect(root.querySelector('h1')!.textContent).toBe('Title');
  });

  it('correctHeadingResemblingParagraph converts to a heading one level below the preceding one', () => {
    const root = mount('<h2>Section</h2><p><strong>Looks like a heading</strong></p>');
    const para = root.querySelector('p')!;
    correctHeadingResemblingParagraph(para, 'Looks like a heading')();
    expect(root.querySelector('h3')!.textContent).toBe('Looks like a heading');
  });

  it('correctHeadingResemblingParagraph defaults to h2 without a preceding heading', () => {
    const root = mount('<p><strong>Standalone</strong></p>');
    correctHeadingResemblingParagraph(root.querySelector('p')!, 'Standalone')();
    expect(root.querySelector('h2')!.textContent).toBe('Standalone');
  });
});

describe('table correctors', () => {
  it('correctTableMissingHeadings converts the first row cells to headers', () => {
    const root = mount('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
    correctTableMissingHeadings(root.querySelector('table')!)();
    const firstRow = root.querySelector('tr')!;
    expect(Array.from(firstRow.children).every((cell) => cell.tagName === 'TH')).toBe(true);
  });

  it('correctTableMissingRows appends a row with matching cell count', () => {
    const root = mount('<table><tbody><tr><th>a</th><th>b</th></tr></tbody></table>');
    correctTableMissingRows(root.querySelector('table')!)();
    const rows = root.querySelectorAll('tr');
    expect(rows).toHaveLength(2);
    expect(rows[1].children).toHaveLength(2);
  });
});
