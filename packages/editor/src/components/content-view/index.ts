import { html } from 'lit';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import '../validations/gutter';
import '../content';
import '../heading-structure';
import { Context } from '../context';
import { editorContextStyles } from '../context/styles.ts';
import contentViewStyles from './styles.ts';

const tag = 'clippy-content-view';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentView;
  }
}

@safeCustomElement(tag)
export class ContentView extends Context {
  static override readonly styles = [...editorContextStyles, contentViewStyles];

  override readonly = true;

  override render() {
    return html`
      <slot name="content" hidden></slot>
      <div class="clippy-content-view__topbar">
        <clippy-heading-structure></clippy-heading-structure>
      </div>
      <div class="clippy-content-view__container">
        <clippy-validations-gutter mode="readonly"></clippy-validations-gutter>
        <clippy-content></clippy-content>
      </div>
    `;
  }
}
