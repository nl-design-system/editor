import { afterEach, describe, expect, it } from 'vitest';
import { resolveViolationDisplay } from './validations';

function setupContent(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

describe('resolveViolationDisplay', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves an element that flows inside a line of text as inline', () => {
    const container = setupContent('<p>Lees <a href="#">meer</a></p>');

    expect(resolveViolationDisplay(container.querySelector('a')!)).toBe('inline');
  });

  it('resolves formatting inside a paragraph as inline', () => {
    const container = setupContent('<p>Lees <strong>meer</strong></p>');

    expect(resolveViolationDisplay(container.querySelector('strong')!)).toBe('inline');
  });

  it('resolves a block element as block', () => {
    const container = setupContent('<p>Lees meer</p>');

    expect(resolveViolationDisplay(container.querySelector('p')!)).toBe('block');
  });

  it('resolves a replaced element as block, so it keeps the gutter band it cannot highlight', () => {
    const container = setupContent('<p><img src="data:," alt="" /></p>');

    expect(resolveViolationDisplay(container.querySelector('img')!)).toBe('block');
  });

  it('follows layout rather than the tag, so a blocked-out inline element resolves as block', () => {
    const container = setupContent('<p>Lees <a href="#" style="display: block">meer</a></p>');

    expect(resolveViolationDisplay(container.querySelector('a')!)).toBe('block');
  });

  it('follows layout rather than a list of rules, so any inline element resolves as inline', () => {
    const container = setupContent('<p>Lees <abbr title="bijvoorbeeld">bijv.</abbr></p>');

    expect(resolveViolationDisplay(container.querySelector('abbr')!)).toBe('inline');
  });

  it('resolves an element that is not in a rendered document as block', () => {
    expect(resolveViolationDisplay(document.createElement('a'))).toBe('block');
  });
});
