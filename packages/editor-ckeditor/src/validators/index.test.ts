import type { Element } from 'ckeditor5';
import { describe, it, expect } from 'vitest';
import { runValidation } from './index.ts';

const makeElement = (name: string, attrs: Record<string, unknown> = {}, children: Element[] = []): Element =>
  ({
    name,
    getAttribute: (key: string) => attrs[key],
    getChildren: () => children,
    is: (type: string) => type === 'element',
  }) as unknown as Element;

describe('runValidation', () => {
  it('returns no errors for a valid document', () => {
    const image = makeElement('imageBlock', { alt: 'A description' });
    const root = makeElement('$root', {}, [makeElement('heading1', {}, []), image]);

    expect(runValidation(root)).toEqual([]);
  });

  it('returns an error for each extra heading1', () => {
    const h1a = makeElement('heading1');
    const h1b = makeElement('heading1');
    const root = makeElement('$root', {}, [h1a, h1b]);

    const results = runValidation(root);
    expect(results).toHaveLength(1);
    expect(results[0].element).toBe(h1b);
  });

  it('returns an error for an image without alt text', () => {
    const image = makeElement('imageBlock', { alt: '' });
    const root = makeElement('$root', {}, [image]);

    const results = runValidation(root);
    expect(results).toHaveLength(1);
    expect(results[0].element).toBe(image);
  });
});
