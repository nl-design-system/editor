import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import { correctEmptyMark, correctEmptyNode, correctUnderlinedMark } from './corrector';

afterEach(unmountAll);

describe('correctEmptyNode', () => {
  it('removes a non-table node', () => {
    const root = mount('<p>keep</p><p></p>');
    const empty = root.querySelectorAll('p')[1];
    correctEmptyNode(empty, 'paragraph')();
    expect(root.querySelectorAll('p')).toHaveLength(1);
  });

  it.each(['tableCell', 'tableHeader', 'tableCaption'])('keeps a %s and selects it instead of removing', (nodeType) => {
    const root = mount('<table><tr><td id="c"></td><td>x</td></tr></table>');
    const cell = root.querySelector('#c')!;
    correctEmptyNode(cell, nodeType)();
    expect(root.querySelector('#c')).not.toBeNull();
  });
});

describe('correctEmptyMark', () => {
  it('removes the mark element', () => {
    const root = mount('<p>text <b>&nbsp;</b></p>');
    correctEmptyMark(root.querySelector('b')!)();
    expect(root.querySelector('b')).toBeNull();
  });
});

describe('correctUnderlinedMark', () => {
  it('unwraps the underline but keeps its text', () => {
    const root = mount('<p>a <u>underlined</u> b</p>');
    correctUnderlinedMark(root.querySelector('u')!)();
    expect(root.querySelector('u')).toBeNull();
    expect(root.textContent).toContain('underlined');
  });
});
