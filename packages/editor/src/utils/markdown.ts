import type { DirectiveResult } from 'lit/directive.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

export const renderMarkdown = (markdown: string): DirectiveResult =>
  unsafeHTML(marked.parseInline(markdown, { async: false }));
