import { html, render } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

/** Renders through Lit, since `renderMarkdown` returns a directive rather than a string. */
const rendered = (text: string): string => {
  const host = document.createElement('div');
  render(html`${renderMarkdown(text)}`, host);
  return host.textContent ?? '';
};

const markup = (text: string): string => {
  const host = document.createElement('div');
  render(html`${renderMarkdown(text)}`, host);
  return host.innerHTML;
};

describe('renderMarkdown', () => {
  it('shows an element name the message mentions instead of opening a tag', () => {
    expect(rendered('Het <strong>-element is leeg.')).toBe('Het <strong>-element is leeg.');
  });

  it('leaves the rest of the sentence unformatted', () => {
    expect(markup('Het <strong>-element is leeg.')).not.toContain('<strong>');
  });

  it('renders the markdown it is given', () => {
    expect(markup('**vet**')).toContain('<strong>vet</strong>');
  });

  it('styles a code span like inline code in the editor content', () => {
    expect(markup('Verwijder het lege `<em>`-element.')).toContain('<code class="nl-code">&lt;em&gt;</code>');
  });

  it('shows the element name a code span quotes', () => {
    expect(rendered('Verwijder het lege `<em>`-element.')).toBe('Verwijder het lege <em>-element.');
  });

  it('does not run markup a validation put in its own message', () => {
    expect(markup('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });
});
