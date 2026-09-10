import type { DirectiveResult } from 'lit/directive.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Marked, type Tokens } from 'marked';

const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Validation copy is plain text, so a `<strong>` in a message names an element rather than opening
 * one. marked hands raw HTML straight to `unsafeHTML`, which would swallow the tag name and leave
 * the rest of the sentence marked up, so render such a run as the text it is. That also keeps a
 * validation a host wrote itself from injecting markup through its messages.
 */
const markdown = new Marked({
  renderer: { html: ({ raw }: Tokens.HTML | Tokens.Tag) => escapeHtml(raw) },
});

export const renderMarkdown = (text: string): DirectiveResult =>
  unsafeHTML(markdown.parseInline(text, { async: false }));
