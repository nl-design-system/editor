import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import { ContextProvider, provide } from '@lit/context';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, html, type PropertyValues } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import type { EditorSettings } from '@/types/settings';
import type { Violation } from '@/types/validation';
import { htmlDocumentContext } from '@/context/htmlDocumentContext';
import { identifierContext } from '@/context/identifierContext';
import { tiptapContext } from '@/context/tiptapContext';
import { validationsContext } from '@/context/validationsContext';
import { editorExtensions } from '@/extensions';
import { initializeLocale } from '@/localization';
import { waitForMedia } from '@/utils/waitForMedia';
import { runValidation } from '@/validations';
import { editorContextStyles } from './styles';

const tag = 'clippy-context';

/** Tracks all active identifier values to enforce uniqueness across instances. */
const registeredIdentifiers = new Set<string>();

/** Properties whose change makes the current violations stale. */
const VALIDATION_SETTINGS = ['validations'] as const;

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Context;
  }
}

/**
 * Context provider that powers the rich text editor. Sets up the TipTap editor
 * instance, runs accessibility validations, and distributes state to child
 * components via Lit context.
 *
 * Use `<clippy-editor>` for the full-featured editor, or compose your own UI by
 * placing `<clippy-context>` directly and adding `<clippy-content>` and any
 * other public components as children.
 *
 * @tag clippy-context
 *
 * @slot value - Place a `<div>` with your initial HTML content here. The slot
 *   is hidden from the user; it is only read by the editor on first render.
 * @slot - Default slot for child components such as `<clippy-content>`,
 *   `<clippy-toolbar>`, `<clippy-validations-gutter>`, etc.
 *
 * @example
 * ```html
 * <clippy-context id="my-editor">
 *   <div slot="value"><p>Hello world</p></div>
 *   <clippy-toolbar></clippy-toolbar>
 *   <clippy-content></clippy-content>
 * </clippy-context>
 * ```
 */
@safeCustomElement(tag)
export class Context extends LitElement {
  static override readonly styles = editorContextStyles;

  /**
   * Unique identifier for this editor instance. Reflected as the host element's
   * `id` attribute and used to scope validation events across multiple editors
   * on the same page.
   */
  @provide({ context: identifierContext })
  @property({ reflect: true, type: String })
  override id = 'clippy-editor-id';

  /**
   * The validations to run. Defaults to every core validation of
   * `@nl-design-system-community/clippy-a11y-validator`. Pass a subset to run only those, and
   * validations built with `defineValidation` to add your own.
   *
   * Property only — a validation is an object, so it has no attribute form.
   *
   * @example
   * ```js
   * editor.validations = [
   *   coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY,
   *   coreValidations.HEADING_MUST_NOT_BE_EMPTY,
   * ];
   * ```
   */
  @property({ attribute: false })
  validations?: readonly Validation[];

  /**
   * When `true`, the editor is rendered in read-only mode. TipTap is not
   * initialised; accessibility validations are still run against the slot DOM.
   * Reflected as the `readonly` attribute.
   * @default false
   */
  @property({ attribute: 'readonly', reflect: true, type: Boolean })
  readonly = false;

  /** @internal */
  @queryAssignedElements({ flatten: true, slot: 'value' })
  contentSlot!: HTMLElement[];

  /** @internal */
  @provide({ context: validationsContext })
  validationsContext = new Map();

  /** @internal */
  lightValidationsContext = new ContextProvider(document.body, {
    context: validationsContext,
    initialValue: new Map(),
  });

  /** @internal */
  updateValidationsContext = (violations: Map<Range, Violation>): void => {
    this.validationsContext = violations;
    this.lightValidationsContext.setValue(this.validationsContext);
  };

  /** @internal */
  @provide({ context: tiptapContext })
  editor?: TiptapEditor;

  /** @internal */
  @provide({ context: htmlDocumentContext })
  htmlDocumentElement?: HTMLElement;

  /**
   * @internal The element readonly mode validates, kept so a settings change can re-run against
   * the same target. Unset while an editor is present, which owns its own DOM.
   */
  private readonlyValidationTarget?: HTMLElement;

  /**
   * @internal The element to validate, or `undefined` while nothing is mounted. Reading
   * `editor.view` throws rather than returning `undefined` before `clippy-content` mounts the
   * editor, so it needs guarding rather than optional chaining.
   */
  private get validationTarget(): HTMLElement | undefined {
    if (this.editor && !this.editor.isDestroyed) {
      try {
        return this.editor.view.dom as HTMLElement;
      } catch {
        return undefined;
      }
    }
    return this.readonlyValidationTarget;
  }

  /** @internal */
  protected get editorSettings(): EditorSettings {
    return {
      readonly: this.readonly,
      ...(this.validations === undefined ? {} : { validations: this.validations }),
    };
  }

  /** @internal */
  protected createEditor(): void {
    const content = this.contentSlot.find((el) => el instanceof HTMLDivElement)?.innerHTML || '';
    this.editor = new TiptapEditor({
      content,
      editable: !this.readonly,
      editorProps: {
        attributes: {
          class: 'clippy-content',
        },
      },
      // Prevent auto-mounting during SSR; Content component calls moumountnt() client-side
      element: null,
      extensions: editorExtensions(() => this.editorSettings, this.updateValidationsContext, this.id),
    });
  }

  override firstUpdated(): void {
    if (registeredIdentifiers.has(this.id)) {
      throw new Error(
        `[clippy-context] Duplicate identifier detected: "${this.id}". Each <clippy-context> must have a unique identifier.`,
      );
    }
    registeredIdentifiers.add(this.id);
    this.htmlDocumentElement = this.contentSlot.find((el) => el instanceof HTMLDivElement);

    if (this.readonly) {
      // In readonly mode, skip TipTap entirely and validate the rendered content.
      // We defer to the next animation frame so that clippy-content has had a chance
      // to render its visible copy of the HTML via unsafeHTML(). Validating against
      // the hidden slot element (htmlDocumentElement) produces Range objects whose
      // getBoundingClientRect() returns zeros, making gutter indicators invisible.
      requestAnimationFrame(() => {
        const contentEl = this.querySelector('clippy-content') as HTMLElement | null;
        const targetEl = contentEl ?? this.htmlDocumentElement;
        if (!targetEl) return;

        // Media elements affect layout dimensions and therefore Range bounding
        // rects. Wait for every media element inside the target to settle before
        // computing indicator positions.
        const mediaEls = [...targetEl.querySelectorAll('img, video, audio')];

        Promise.all(mediaEls.map((el) => waitForMedia(el))).then(() => {
          this.readonlyValidationTarget = targetEl;
          runValidation(targetEl, this.validations, this.updateValidationsContext);
        });
      });
    } else {
      // Non-readonly: create the TipTap editor (clippy-editor enables the
      // Validation extension via _includeValidationExtension).
      this.createEditor();
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('readonly') && this.editor) {
      this.editor.setEditable(!this.readonly);
    }
    // The extension reads the settings afresh on every run, so re-running is enough to pick the
    // new ones up. `updated` only fires after the first render, so this never doubles up with the
    // initial run in `onCreate` or the readonly animation frame.
    const target = this.validationTarget;
    if (target && VALIDATION_SETTINGS.some((setting) => changedProperties.has(setting))) {
      runValidation(target, this.validations, this.updateValidationsContext);
    }
  }

  /** @internal */
  private isLocaleInitialized = false;

  override connectedCallback() {
    super.connectedCallback();
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
    registeredIdentifiers.delete(this.id);
    this.htmlDocumentElement = undefined;
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html` <slot name="value" hidden></slot><slot></slot>`;
  }
}
