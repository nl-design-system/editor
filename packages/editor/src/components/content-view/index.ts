import { localized, msg } from '@lit/localize';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import ListIcon from '@tabler/icons/outline/list.svg?raw';
import { html } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import '../validations/gutter';
import '../content';
import '../content-view-dialog';
import { Context } from '../context';
import { editorContextStyles } from '../context/styles.ts';
import contentViewStyles from './styles.ts';

const tag = 'clippy-content-view';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentView;
  }
}

@localized()
@safeCustomElement(tag)
export class ContentView extends Context {
  static override readonly styles = [...editorContextStyles, contentViewStyles];

  override readonly = true;

  #handleClick(mode: 'heading-structure' | 'link-list') {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        bubbles: true,
        composed: true,
        detail: { mode },
      }),
    );
  }

  override render() {
    return html`
      <slot name="value" hidden></slot>
      <div class="clippy-content-view__topbar">
        <clippy-button purpose="subtle" @click=${() => this.#handleClick('heading-structure')}>
          <clippy-icon slot="iconStart">${unsafeSVG(ListIcon)}</clippy-icon>
          ${msg('Heading structure')}
        </clippy-button>
        <clippy-button purpose="subtle" @click=${() => this.#handleClick('link-list')}>
          <clippy-icon slot="iconStart">${unsafeSVG(LinkIcon)}</clippy-icon>
          ${msg('Links')}
        </clippy-button>
      </div>
      <div class="clippy-content-view__container">
        <clippy-validations-gutter mode="readonly"></clippy-validations-gutter>
        <clippy-content></clippy-content>
      </div>
      <clippy-content-view-dialog></clippy-content-view-dialog>
    `;
  }
}
