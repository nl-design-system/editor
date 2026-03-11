import { ContextProvider, provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult } from '@/types/validation.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { editorExtensions } from '@/extensions';
import { initializeLocale } from '@/localization.ts';
import { sanitizeTopHeadingLevel } from '@/utils/sanitize.ts';
import { editorContextStyles } from './styles.ts';

const tag = 'clippy-context';

/** Tracks all active identifier values to enforce uniqueness across instances. */
const registeredIdentifiers = new Set<string>();

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Context;
  }
}

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
 *       <clippy-content></clippy-content>
 *     </clippy-editor>
 */
@customElement(tag)
export class Context extends LitElement {
  static override readonly styles = editorContextStyles;

  @provide({ context: identifierContext })
  @property({ attribute: 'id', type: String })
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
          class: 'clippy-content',
        },
      },
      extensions: editorExtensions(
        { disableRules: this.disableRules, enableRules: this.enableRules, topHeadingLevel: sanitizedTopHeadingLevel },
        this.updateValidationsContext,
        this.identifier,
      ),
    });
  }

  override firstUpdated(): void {
    this.createEditor();
  }

  private isLocaleInitialized = false;

  override connectedCallback() {
    super.connectedCallback();
    if (registeredIdentifiers.has(this.identifier)) {
      throw new Error(
        `[clippy-context] Duplicate identifier detected: "${this.identifier}". Each <clippy-context> must have a unique identifier.`,
      );
    }
    registeredIdentifiers.add(this.identifier);
    this.lightValidationsContext.hostConnected();
    if (!this.isLocaleInitialized) {
      this.isLocaleInitialized = true;
      initializeLocale().then(() => {
        this.requestUpdate();
      });
    }
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
    registeredIdentifiers.delete(this.identifier);
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html` <slot name="content" hidden></slot><slot></slot>`;
  }
}
