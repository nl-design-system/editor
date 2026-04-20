import type { Editor as TiptapEditor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap, ValidationResult } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { getHighestSeverityEntryByPosition } from '@/utils/validations.ts';
import imageListStyles from './styles.ts';

interface ImageEntry {
  alt: string;
  height: string | null;
  href: string | null;
  pos: number;
  src: string;
  target: string | null;
  validationEntry: [string, ValidationResult] | null;
  width: string | null;
}

const tag = 'clippy-image-list';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ImageList;
  }
}

@localized()
@safeCustomElement(tag)
export class ImageList extends LitElement {
  static override readonly styles = [
    imageListStyles,
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
  ];

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: TiptapEditor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  get #images(): ImageEntry[] {
    if (!this.editor) return [];
    const images: ImageEntry[] = [];
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image') {
        images.push({
          alt: (node.attrs['alt'] as string) ?? '',
          height: node.attrs['height'] ? String(node.attrs['height']) : null,
          href: (node.attrs['href'] as string) || null,
          pos,
          src: (node.attrs['src'] as string) ?? '',
          target: (node.attrs['target'] as string) || null,
          validationEntry: getHighestSeverityEntryByPosition(this.validationsMap, pos),
          width: node.attrs['width'] ? String(node.attrs['width']) : null,
        });
      }
    });
    return images;
  }

  #scrollToImage(key: string | undefined, pos: number) {
    if (!this.editor) return;
    try {
      const { view } = this.editor;
      const nodeDom = view.nodeDOM?.(pos) ?? view.domAtPos(pos).node;
      const target = nodeDom instanceof HTMLElement ? nodeDom : (nodeDom as Node)?.parentElement;
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('[clippy-image-list] Cannot scroll to image', err);
    }

    if (key) {
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, {
          bubbles: true,
          composed: true,
          detail: { key },
        }),
      );
    }
  }

  /**
   * Derive WCAG 1.1.1 Non-text Content status info for a given image.
   * Returns structured accessibility information to render in the panel.
   */
  #getWcagInfo(alt: string, href: string | null): Array<{ label: string; status: 'pass' | 'fail' | 'warning' }> {
    const isDecorative = alt === '';
    const hasAlt = alt !== undefined && alt !== null;
    const hasMeaningfulAlt = hasAlt && alt.trim().length > 0;
    const isFilenameAlt = hasMeaningfulAlt && /\.(png|jpe?g|gif|svg|webp|bmp|tiff?)$/i.test(alt.trim());
    const isRedundantLinkAlt = href !== null && hasMeaningfulAlt;

    const results: Array<{ label: string; status: 'pass' | 'fail' | 'warning' }> = [];

    // WCAG 1.1.1 — alt attribute presence
    if (!hasAlt) {
      results.push({
        label: msg('WCAG 1.1.1: Missing alt attribute (Error)'),
        status: 'fail',
      });
    } else if (isDecorative) {
      results.push({
        label: msg('WCAG 1.1.1: Marked as decorative (alt="") — screen readers will skip'),
        status: 'pass',
      });
    } else if (isFilenameAlt) {
      results.push({
        label: msg('WCAG 1.1.1: Alt text looks like a filename — use a meaningful description'),
        status: 'warning',
      });
    } else {
      results.push({
        label: msg('WCAG 1.1.1: Alt text present'),
        status: 'pass',
      });
    }

    // Link context — WCAG 2.4.4 / 2.4.9
    if (href !== null) {
      if (isDecorative) {
        results.push({
          label: msg('WCAG 2.4.4: Image is a link but has empty alt — add a link purpose description'),
          status: 'fail',
        });
      } else if (isRedundantLinkAlt) {
        results.push({
          label: msg('WCAG 2.4.4: Image link — alt text will serve as the accessible link name'),
          status: 'pass',
        });
      }
    }

    return results;
  }

  override render() {
    const images = this.#images;

    return html`
      <section aria-label=${msg('Images')}>
        ${images.length > 0
          ? html`
              <ol class="clippy-image-list__list" role="list">
                ${map(images, ({ alt, height, href, pos, src, target, validationEntry, width }, index) => {
                  const severity = validationEntry?.[1].severity ?? null;
                  const wcagItems = this.#getWcagInfo(alt, href);
                  const label = alt.trim() || `${msg('Image')} ${index + 1}`;
                  const dimensionText =
                    width && height
                      ? `${width} × ${height} px`
                      : width
                        ? `${width} px wide`
                        : height
                          ? `${height} px tall`
                          : null;

                  return html`
                    <li class="clippy-image-list__item">
                      <!-- Header: severity badge + scroll link + anchor badge -->
                      <div class="clippy-image-list__item-header">
                        ${severity
                          ? html`<span
                              class="nl-data-badge clippy-image-list__badge--${severity}"
                              aria-label=${severity}
                            ></span>`
                          : nothing}
                        <a
                          class="nl-link"
                          href="#"
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToImage(validationEntry?.[0], pos);
                          }}
                        >
                          ${label}
                        </a>
                        ${href
                          ? html`<span class="clippy-image-list__anchor-badge" aria-label=${msg('Inside a link')}>
                              🔗 ${msg('Link')}
                            </span>`
                          : nothing}
                      </div>

                      <!-- Thumbnail -->
                      ${src
                        ? html`
                            <div class="clippy-image-list__thumbnail-wrapper">
                              <img
                                class="clippy-image-list__thumbnail"
                                src=${src}
                                alt=${alt || msg('(no alt text)')}
                                role=${alt === '' ? 'presentation' : 'img'}
                              />
                            </div>
                          `
                        : nothing}

                      <!-- Metadata -->
                      <dl class="clippy-image-list__meta">
                        <div class="clippy-image-list__meta-row">
                          <dt class="clippy-image-list__meta-label">${msg('Alt:')}</dt>
                          <dd
                            class="clippy-image-list__meta-value${alt.trim() ? '' : ' clippy-image-list__meta-value--empty'}"
                          >
                            ${alt === '' ? msg('(empty — decorative)') : alt.trim() || msg('(missing)')}
                          </dd>
                        </div>
                        ${dimensionText
                          ? html`
                              <div class="clippy-image-list__meta-row">
                                <dt class="clippy-image-list__meta-label">${msg('Dimensions:')}</dt>
                                <dd class="clippy-image-list__meta-value">${dimensionText}</dd>
                              </div>
                            `
                          : nothing}
                        ${href
                          ? html`
                              <div class="clippy-image-list__meta-row">
                                <dt class="clippy-image-list__meta-label">${msg('Link URL:')}</dt>
                                <dd class="clippy-image-list__meta-value clippy-image-list__src" title=${href}>
                                  ${href}
                                </dd>
                              </div>
                              ${target
                                ? html`
                                    <div class="clippy-image-list__meta-row">
                                      <dt class="clippy-image-list__meta-label">${msg('Opens in:')}</dt>
                                      <dd class="clippy-image-list__meta-value">
                                        ${target === '_blank' ? msg('new tab/window') : target}
                                      </dd>
                                    </div>
                                  `
                                : nothing}
                            `
                          : nothing}
                        <div class="clippy-image-list__meta-row">
                          <dt class="clippy-image-list__meta-label">${msg('Source:')}</dt>
                          <dd class="clippy-image-list__meta-value clippy-image-list__src" title=${src}>
                            ${src || msg('(missing)')}
                          </dd>
                        </div>
                      </dl>

                      <!-- WCAG / screen-reader information -->
                      <div class="clippy-image-list__wcag">
                        <p class="clippy-image-list__wcag-title">${msg('Accessibility & screen reader info')}</p>
                        ${map(
                          wcagItems,
                          ({ label: wcagLabel, status }) => html`
                            <div class="clippy-image-list__wcag-item">
                              <span
                                class="clippy-image-list__wcag-status clippy-image-list__wcag-status--${status}"
                                aria-label=${status === 'pass' ? msg('Pass') : status === 'fail' ? msg('Fail') : msg('Warning')}
                              >
                                ${status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠'}
                              </span>
                              <span class="clippy-image-list__wcag-text">${wcagLabel}</span>
                            </div>
                          `,
                        )}
                        ${alt === '' && href === null
                          ? html`
                              <div class="clippy-image-list__wcag-item">
                                <span class="clippy-image-list__wcag-status clippy-image-list__wcag-status--pass" aria-label=${msg('Pass')}>✓</span>
                                <span class="clippy-image-list__wcag-text">
                                  ${msg('Screen readers: image will be announced as decorative and ignored')}
                                </span>
                              </div>
                            `
                          : html`
                              <div class="clippy-image-list__wcag-item">
                                <span class="clippy-image-list__wcag-status clippy-image-list__wcag-status--pass" aria-label=${msg('Pass')}>ℹ</span>
                                <span class="clippy-image-list__wcag-text">
                                  ${msg('Screen readers: image will be announced using the alt text')}
                                </span>
                              </div>
                            `}
                      </div>
                    </li>
                  `;
                })}
              </ol>
            `
          : html`
              <p class="nl-paragraph clippy-image-list__empty">${msg('No images found in this document.')}</p>
            `}
      </section>
    `;
  }
}


