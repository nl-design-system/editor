import { consume, ContextProvider, provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import './components/guideline';
import './components/toolbar';
import './components/validations/gutter';
import './components/validations/list';
import './components/validations/drawer';
import './components/bubble-menu';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult, ValidationsMap } from '@/types/validation.ts';
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

/**
 * Make rich text content editable with this element.
 * Put the rich text content inside the `content` slot.
 * Use other custom elements from our collection to create your own rich text editor.
 *
 * A very minimal example:
 *
 *     <clippy-editor>
 *       <!-- This content is the source -->
 *       <div slot=""><h1>Page title</h1></div>
 *       <!-- This is the editable rendering the content above -->
 *       <clippy-editor-content></clippy-editor-content>
 *     </clippy-editor>
 */
@customElement('clippy-editor-context')
export class EditorContext extends LitElement {
  static override readonly styles = [editorStyles];

  @property({ type: String })
  identifier = 'clippy-editor-id';

  @property({ attribute: 'top-heading-level', reflect: true, type: Number })
  topHeadingLevel = 1;

  @property({
    attribute: 'enable-rules',
    converter: {
      fromAttribute: (value: string) => {
        return value.split(/\s+/g);
      },
      toAttribute: (value: string[]) => {
        return value.join(' ');
      },
    },
    reflect: true,
  })
  enableRules: string[] = ['*'];

  @property({
    attribute: 'disable-rules',
    converter: {
      fromAttribute: (value: string) => {
        return value.split(/\s+/g);
      },
      toAttribute: (value: string[]) => {
        return value.join(' ');
      },
    },
    reflect: true,
  })
  disableRules: string[] = [];

  @queryAssignedElements({ flatten: true, slot: 'content' })
  contentSlot!: HTMLElement[];

  @provide({ context: validationsContext })
  validationsContext = new Map();

  // create a provider for the whole document body.
  // https://lit.dev/docs/data/context/
  // https://github.com/lit/lit/blob/main/packages/context/README.md
  lightValidationsContext = new ContextProvider(document.body, {
    context: validationsContext,
    initialValue: new Map(),
  });

  updateValidationsContext = (resultMap: Map<string, ValidationResult>): void => {
    this.validationsContext = resultMap;
    this.lightValidationsContext.setValue(this.validationsContext);
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
      extensions: editorExtensions(
        { disableRules: this.disableRules, enableRules: this.enableRules, topHeadingLevel: sanitizedTopHeadingLevel },
        this.updateValidationsContext,
      ),
    });
  }

  override firstUpdated(): void {
    this.createEditor();
  }

  override connectedCallback() {
    this.lightValidationsContext.hostConnected();
    super.connectedCallback();

    // Find custom elements that are already defined, and might have dispatched the `context-request` event already
    const isCustomElement = (x: Element) => /-/.test(x.localName);
    Array.from(this.querySelectorAll(':defined'))
      .filter((x) => isCustomElement(x))
      .forEach((x) => {
        // "Have you tried turning it off and on again?"
        // Detach and re-attach the node from the tree, to trigger the `ContextConsumer` emitting a new `context-request` event
        const nextSibling = x.nextSibling;
        const parentNode = x.parentNode;
        parentNode?.removeChild(x);
        parentNode?.insertBefore(x, nextSibling);
      });
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html` <slot name="content" hidden></slot><slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-editor-context': EditorContext;
  }
}

/**
 * All in one: editor context plus user interface.
 */
@customElement('clippy-editor')
export class Editor extends EditorContext {
  override render() {
    return html`
      <clippy-toolbar></clippy-toolbar>
      <div class="clippy-editor-container" id=${EDITOR_ID}>
        <slot name="content" hidden></slot>
        <clippy-editor-content></clippy-editor-content>
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

/**
 * The editable content of the rich text editor. It is a separate element, so you can decide
 * where it goes in your user interface.
 *
 * Decide if you want to render in the Shadow DOM or not. This feature is available
 * to experiment, and find out the pro's and cons. The default is Light DOM rendering.
 *
 *     <clippy-editor-content shadow><clippy-editor-content>
 *
 * The element requires to have the context of an editor instance, so it must always
 * be rendered somewhere inside a <clippy-editor> element.
 */
@customElement('clippy-editor-content')
export class EditorContent extends LitElement {
  static override readonly styles = [
    css`
      :host,
      .inline,
      .inline .ProseMirror,
      .inline .ProseMirror > * {
        display: inline;
      }
    `,
  ];
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: TiptapEditor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @property({ attribute: true })
  public shadow?: boolean;

  @property({ attribute: true, type: Boolean })
  public inline?: boolean;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    const el = this.shadow ? this.shadowRoot?.firstElementChild : this;
    if (el) {
      this.editor?.mount(el);
    }
  }
  override render() {
    if (this.shadow) {
      return html`<div class=${this.inline ? 'inline' : nothing}><slot></slot></div>`;
    } else return null;
  }
  protected override createRenderRoot() {
    return this.shadow ? super.createRenderRoot() : this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-editor-content': EditorContent;
  }
}
