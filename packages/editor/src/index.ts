import { provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { UndoRedo } from '@tiptap/extensions';
import { defineCustomElements } from '@utrecht/web-component-library-stencil/loader';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './components/toolbar';
import './components/validations/gutter';
import './components/validations/drawer';
import type { ValidationResult } from '@/types/validation.ts';
import { tiptapContext } from './context/tiptapContext.ts';
import { validationsContext } from './context/validationsContext.ts';
import editorStyles from './styles';
import Validation from './validators';

const EDITOR_ID = 'editor';

export type content = string;

defineCustomElements();

@customElement('clippy-editor')
export class Editor extends LitElement {
  static override readonly styles = [editorStyles];

  @property({ type: String })
  identifier = 'clippy-editor-id';

  @property({ type: String })
  initialContent = this.querySelector('template')?.innerHTML ?? '<h1>Start met kopniveau 1</h1><p>Lorem ipsum</p>';

  @provide({ context: validationsContext })
  validationsContext = new Map();

  updateValidationsContext = (resultMap: Map<string, ValidationResult>): void => {
    this.validationsContext = resultMap;
  };

  @provide({ context: tiptapContext })
  editor: TiptapEditor = new TiptapEditor({
    content: this.initialContent,
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Underline,
      UndoRedo,
      Validation.configure({
        updateValidationsContext: this.updateValidationsContext,
      }),
    ],
  });

  override firstUpdated() {
    const editorEl = this.shadowRoot?.getElementById(EDITOR_ID);
    if (editorEl) {
      this.editor.setOptions({
        editorProps: {
          attributes: {
            id: this.identifier,
            class: 'clippy-editor-content',
          },
        },
      });
      this.editor.mount(editorEl);
    }
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <clippy-toolbar></clippy-toolbar>
      <div id=${EDITOR_ID}></div>
      <clippy-validations-dialog></clippy-validations-dialog>
      <clippy-validations-gutter></clippy-validations-gutter>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-editor': Editor;
  }
}
