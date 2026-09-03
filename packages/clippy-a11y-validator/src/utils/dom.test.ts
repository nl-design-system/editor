import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { unwrapElement, visibleTextNodes } from './dom.ts';

describe('visibleTextNodes', () => {
  it('collects text nodes that hold content', () => {
    expect(visibleTextNodes(render('<p><b>a</b> b</p>')).map((node) => node.data)).toEqual(['a', ' b']);
  });

  it('skips whitespace-only text nodes', () => {
    expect(visibleTextNodes(render('<p> <b> </b> </p>'))).toEqual([]);
  });
});

describe('unwrapElement', () => {
  it('replaces the element with its children', () => {
    const paragraph = render('<p><strong>bold</strong> tail</p>');
    unwrapElement(paragraph.querySelector('strong')!);
    expect(paragraph.innerHTML).toBe('bold tail');
  });

  it('does nothing for a detached element', () => {
    const detached = document.createElement('strong');
    expect(() => unwrapElement(detached)).not.toThrow();
  });
});
