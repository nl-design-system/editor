import type { DirectiveResult } from 'lit/directive.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked, type Tokens } from 'marked';
import { contentClasses } from '@/constants';

const escapeHtml = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * Validation copy is plain text, so a `<strong>` in a message names an element rather than opening
 * one. marked hands raw HTML straight to `unsafeHTML`, which would swallow the tag name and leave
 * the rest of the sentence marked up, so render such a run as the text it is. That also keeps a
 * validation a host wrote itself from injecting markup through its messages.
 *
 * A code span carries the same class as inline code in the editor's own content, so an element
 * name a message quotes looks the same wherever the author meets it.
 */
const markdown = new Marked({
  renderer: {
    codespan: ({ text }: Tokens.Codespan) => `<code class="${contentClasses.code}">${escapeHtml(text)}</code>`,
    html: ({ raw }: Tokens.HTML | Tokens.Tag) => escapeHtml(raw),
  },
});

export const renderMarkdown = (text: string): DirectiveResult =>
  unsafeHTML(markdown.parseInline(text, { async: false }));
