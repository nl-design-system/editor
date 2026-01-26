import { provide } from '@lit/context';
import codeBlockStyle from '@nl-design-system-candidate/code-block-css/code-block.css?inline';
import codeStyle from '@nl-design-system-candidate/code-css/code.css?inline';
import './components/toolbar';
import './components/validations/gutter';
import './components/validations/drawer';
import './components/bubble-menu';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import markStyle from '@nl-design-system-candidate/mark-css/mark.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { Editor as TiptapEditor } from '@tiptap/core';
import dataListStyle from '@utrecht/data-list-css/dist/index.css?inline';
import orderedListStyle from '@utrecht/ordered-list-css/dist/index.css?inline';
import tableStyle from '@utrecht/table-css/dist/index.css?inline';
import unorderedListStyle from '@utrecht/unordered-list-css/dist/index.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult } from '@/types/validation.ts';
import { editorExtensions } from '@/extensions';
import { tiptapContext } from './context/tiptapContext.ts';
import { validationsContext } from './context/validationsContext.ts';
import editorStyles from './styles';

const EDITOR_ID = 'editor';

const sanitizeTopHeadingLevel = (number: number): number => {
  if (!Number.isNaN(number) && number >= 1 && number <= 6) {
    return number;
  }
  return 1;
};

@customElement('clippy-editor')
export class Editor extends LitElement {
  static override readonly styles = [
    editorStyles,
    unsafeCSS(codeBlockStyle),
    unsafeCSS(codeStyle),
    unsafeCSS(headingStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(markStyle),
    unsafeCSS(orderedListStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(unorderedListStyle),
    unsafeCSS(tableStyle),
    unsafeCSS(dataListStyle),
  ];

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
