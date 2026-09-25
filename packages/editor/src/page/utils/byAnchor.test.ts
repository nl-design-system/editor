import { beforeEach, describe, expect, it } from 'vitest';
import { byAnchor } from './byAnchor';

const source = (anchor: Element) => ({ anchor, fragment: anchor, label: 'Body' });

beforeEach(() => {
  document.body.replaceChildren();
});

describe('byAnchor', () => {
  it('orders sources by where their anchors sit in the document', () => {
    document.body.innerHTML = '<header></header><main></main><footer></footer>';
    const [header, main, footer] = [...document.body.children].map(source);

    expect([footer, header, main].sort(byAnchor)).toEqual([header, main, footer]);
  });

  it('orders an anchor before the anchors nested inside it', () => {
    document.body.innerHTML = '<main><section></section></main>';
    const main = source(document.querySelector('main')!);
    const section = source(document.querySelector('section')!);

    expect([section, main].sort(byAnchor)).toEqual([main, section]);
  });

  it('treats sources sharing an anchor as equal', () => {
    const anchor = document.createElement('div');
    document.body.append(anchor);

    expect(byAnchor(source(anchor), { ...source(anchor), label: 'Title' })).toBe(0);
  });
});
