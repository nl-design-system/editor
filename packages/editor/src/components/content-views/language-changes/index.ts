import type { Editor as TiptapEditor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { findNearestAncestorAttribute } from '@/utils/domTraverser.ts';
import languageChangesStyles from './styles.ts';

const PREVIEW_LENGTH = 20;

interface LanguageChangeEntry {
  lang: string;
  /** null means "document start" — no explicit node position */
  pos: number | null;
  preview: string;
  truncated: boolean;
  /** true when the effective language equals the ambient document language */
  isDocumentLanguage: boolean;
}

const tag = 'clippy-language-changes';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: LanguageChanges;
  }
}

@localized()
@safeCustomElement(tag)
export class LanguageChanges extends LitElement {
  static override readonly styles = [
    languageChangesStyles,
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
  ];

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: TiptapEditor;

  get #languageChanges(): LanguageChangeEntry[] {
    if (!this.editor) return [];
    const entries: LanguageChangeEntry[] = [];

    const docLang = findNearestAncestorAttribute(this.editor.view.dom as Element, 'lang');

    // First entry: the ambient document language.
    if (docLang) {
      const docText = this.editor.state.doc.textContent;
      entries.push({
        isDocumentLanguage: true,
        lang: docLang,
        pos: null,
        preview: docText.slice(0, PREVIEW_LENGTH),
        truncated: docText.length > PREVIEW_LENGTH,
      });
    }

    // Walk all block nodes. Whenever the effective language changes (including
    // a revert to docLang on a node without an explicit lang), emit an entry.
    let prevLang: string = docLang ?? '';

    this.editor.state.doc.descendants((node, pos) => {
      if (!node.isBlock || node.type.name === 'doc') return;
      if (!('lang' in node.attrs)) return;

      const explicitLang = node.attrs['lang'] as string | null;
      // A node with no explicit lang reverts to the document language.
      const effectiveLang: string | null = explicitLang ?? docLang;
      if (effectiveLang === null || effectiveLang === prevLang) return;

      const fullText = node.textContent;
      entries.push({
        isDocumentLanguage: docLang !== null && effectiveLang === docLang,
        lang: effectiveLang,
        pos,
        preview: fullText.slice(0, PREVIEW_LENGTH),
        truncated: fullText.length > PREVIEW_LENGTH,
      });

      prevLang = effectiveLang;
    });

    return entries;
  }

  #scrollToNode(pos: number | null) {
    if (!this.editor) return;

    if (pos === null) {
      // Document-language entry: scroll to the top of the editor.
      const dom = this.editor.view.dom;
      if (dom instanceof HTMLElement) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    try {
      const { view } = this.editor;
      const nodeDom = view.nodeDOM?.(pos) ?? view.domAtPos(pos).node;
      const target = nodeDom instanceof HTMLElement ? nodeDom : (nodeDom as Node)?.parentElement;
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('[clippy-language-changes] Cannot scroll to node', err);
    }
  }

  override render() {
    const entries = this.#languageChanges;

    return html`
      <nav aria-label=${msg('Language changes')}>
        ${entries.length > 0
          ? html`
              <ol class="clippy-language-changes__list" role="list">
                ${map(entries, ({ isDocumentLanguage, lang, pos, preview, truncated }) => {
                  return html`
                    <li class="clippy-language-changes__item">
                      <span class="nl-data-badge" aria-label=${msg('Language: ') + lang}>${lang}</span>
                      <div class="clippy-language-changes__item-content">
                        <a
                          class="nl-link"
                          href="#"
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToNode(pos);
                          }}
                        >
                          ${preview || msg('(empty)')}${truncated ? '…' : ''}
                        </a>
                        ${isDocumentLanguage
                          ? html`<span class="clippy-language-changes__doc-label">${msg('(document language)')}</span>`
                          : ''}
                      </div>
                    </li>
                  `;
                })}
              </ol>
            `
          : html`
              <p class="nl-paragraph clippy-language-changes__empty">
                ${msg('No language changes found in this document.')}
              </p>
            `}
      </nav>
    `;
  }
}
