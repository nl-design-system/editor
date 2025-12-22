import { provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import './components/toolbar';
import './components/validations/gutter';
import './components/validations/drawer';
import './components/bubble-menu';
import { defineCustomElements } from '@utrecht/web-component-library-stencil/loader';
import { LitElement, html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult } from '@/types/validation.ts';
import { editorExtensions } from '@/extensions';
import { tiptapContext } from './context/tiptapContext.ts';
import { validationsContext } from './context/validationsContext.ts';
import editorStyles from './styles';

const EDITOR_ID = 'editor';

defineCustomElements();

const sanitizeTopHeadingLevel = (number: number): number => {
  if (!Number.isNaN(number) && number >= 1 && number <= 6) {
    return number;
  }
  return 1;
};

@customElement('clippy-editor')
export class Editor extends LitElement {
  static override readonly styles = [editorStyles];

  @property({ type: String })
  identifier = 'clippy-editor-id';

  @property({ attribute: 'top-heading-level', reflect: true, type: Number })
  topHeadingLevel = 1;

  @queryAssignedElements({ flatten: true, slot: 'content' })
  contentSlot!: HTMLElement[];

  @provide({ context: validationsContext })
  validationsContext = new Map();

  updateValidationsContext = (resultMap: Map<string, ValidationResult>): void => {
    this.validationsContext = resultMap;
  };

  @provide({ context: tiptapContext })
  editor?: TiptapEditor;

  private createEditor(): void {
    const sanitizedTopHeadingLevel = sanitizeTopHeadingLevel(this.topHeadingLevel);
    const content = this.contentSlot.find((el) => el instanceof HTMLDivElement)?.innerHTML || '';
    this.editor = new TiptapEditor({
      content,
      editorProps: {
        attributes: {
          id: this.identifier,
          class: 'clippy-editor-content',
        },
      },
      extensions: editorExtensions({ topHeadingLevel: sanitizedTopHeadingLevel }, this.updateValidationsContext),
    });
    const mountTarget = this.shadowRoot?.getElementById(EDITOR_ID);
    if (mountTarget) {
      this.contentSlot.forEach((el) => el.remove());
      this.editor.mount(mountTarget);
    }
  }

  override firstUpdated(): void {
    this.createEditor();
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <clippy-toolbar></clippy-toolbar>
      <div class="clippy-editor-container" id=${EDITOR_ID}>
        <slot name="content" hidden></slot>
        <clippy-validations-gutter></clippy-validations-gutter>
        <clippy-bubble-menu class="clippy-bubble-menu"></clippy-bubble-menu>
      </div>
      <clippy-validations-dialog></clippy-validations-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-editor': Editor;
  }
}
