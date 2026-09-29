import {
  type DocumentViolation,
  getClippyDocument,
  type RegisteredSource,
} from '@nl-design-system-community/editor/document';
import { ButtonView, Plugin, type Locale, type ObservableChangeEvent } from 'ckeditor5';
import { adoptClippyStyles } from '../styles/';
import { ContentClasses } from './ContentClasses.ts';
import { attachSharedPanel, type SharedPanel } from './sharedPanel.ts';

export class ClippyPlugin extends Plugin {
  static get pluginName() {
    return 'ClippyPlugin' as const;
  }

  static get requires() {
    // Ensure the design-system classes are applied to CKEditor content
    return [ContentClasses] as const;
  }

  private _source: RegisteredSource | null = null;
  private _panel: SharedPanel | null = null;
  private readonly _buttons = new Set<ButtonView>();
  private _count = 0;
  private _unsubscribe: (() => void) | null = null;
  private _unlistenPanel: (() => void) | null = null;

  init(): void {
    this._registerClippyButton();
    this._observeSourceEditingMode();
    this.editor.on('ready', () => this._setup());
  }

  private _setup(): void {
    const editableEl = this.editor.ui.getEditableElement();
    if (!editableEl) {
      return;
    }

    const clippyDocument = getClippyDocument();
    this._source = clippyDocument.register({
      anchor: this.editor.ui.element ?? editableEl,
      correct: this._correct,
      focus: this._focus,
      fragment: editableEl,
      label: this._label(),
    });

    adoptClippyStyles();

    this._panel = attachSharedPanel(clippyDocument, this._source.id);
    this._unlistenPanel = this._panel.onChange(() => {
      this._buttons.forEach((button) => {
        button.isOn = this._panel?.isShowing() ?? false;
      });
    });

    this._unsubscribe = clippyDocument.subscribe((violations) => {
      this._count = violations.filter(({ source }) => source === this._source?.id).length;
      this._buttons.forEach((button) => {
        button.label = this._buttonLabel();
      });
    });

    this._addClippyButtonToToolbar();
  }

  private _label(): string {
    const sourceElement =
      'sourceElement' in this.editor ? (this.editor.sourceElement as HTMLElement | undefined) : undefined;
    const fieldLabel =
      sourceElement && 'labels' in sourceElement
        ? (sourceElement.labels as NodeListOf<HTMLLabelElement> | null)?.[0]?.textContent?.trim()
        : undefined;

    return fieldLabel || 'Editor';
  }

  private _buttonLabel(): string {
    return this._count ? `Clippy (${this._count})` : 'Clippy';
  }

  private _registerClippyButton(): void {
    this.editor.ui.componentFactory.add('clippyAccessibilityNotifications', (locale: Locale) => {
      const button = new ButtonView(locale);
      button.set({
        class: 'clippy-ckeditor-button',
        isOn: this._panel?.isShowing() ?? false,
        isToggleable: true,
        label: this._buttonLabel(),
        tooltip: true,
        withText: true,
      });
      button.on('execute', () => this._panel?.toggle());
      this._buttons.add(button);
      return button;
    });
  }

  private _addClippyButtonToToolbar(): void {
    const toolbar = 'toolbar' in this.editor.ui.view ? this.editor.ui.view.toolbar : undefined;
    const isConfigured = [...this._buttons].some((button) => button.element?.isConnected);
    if (!toolbar || isConfigured) {
      return;
    }

    toolbar.items.add(this.editor.ui.componentFactory.create('clippyAccessibilityNotifications'));
  }

  // SourceEditing plugin freezes the raw HTML view when entered. Disable clippy while it's active.
  private _observeSourceEditingMode(): void {
    if (!this.editor.plugins.has('SourceEditing')) {
      return;
    }

    const sourceEditing = this.editor.plugins.get('SourceEditing') as Plugin & { isSourceEditingMode: boolean };
    sourceEditing.on<ObservableChangeEvent<boolean>>(
      'change:isSourceEditingMode',
      (_evt, _name, isSourceEditingMode) => {
        this._buttons.forEach((button) => {
          button.isEnabled = !isSourceEditingMode;
        });
        if (isSourceEditingMode) {
          this._panel?.close();
        }
      },
    );
  }

  private readonly _focus = ({ element }: DocumentViolation): void => {
    const domRange = element.ownerDocument.createRange();
    domRange.selectNodeContents(element);
    const viewRange = this.editor.editing.view.domConverter.domRangeToView(domRange);
    if (!viewRange) {
      return;
    }

    const modelRange = this.editor.editing.mapper.toModelRange(viewRange);
    this.editor.model.change((writer) => writer.setSelection(modelRange));
    this.editor.editing.view.scrollToTheSelection();
    this.editor.focus();
  };

  private readonly _correct = ({ correct }: DocumentViolation): void => {
    const editableEl = this.editor.ui.getEditableElement();
    const root = this.editor.model.document.getRoot();
    if (!correct || !editableEl || !root) {
      return;
    }

    const before = editableEl.innerHTML;
    correct();
    if (editableEl.innerHTML === before) {
      return;
    }

    const corrected = editableEl.ownerDocument.createDocumentFragment();
    corrected.append(...editableEl.cloneNode(true).childNodes);
    const viewContent = this.editor.editing.view.domConverter.domToView(corrected, { bind: false, withChildren: true });
    if (!viewContent?.is('documentFragment')) {
      return;
    }

    const modelContent = this.editor.data.toModel(viewContent);
    this.editor.model.change((writer) => {
      writer.remove(writer.createRangeIn(root));
      writer.insert(modelContent, root, 0);
    });
  };

  override destroy(): void {
    this._unsubscribe?.();
    this._source?.unregister();
    this._source = null;
    this._unlistenPanel?.();
    this._panel?.release();
    this._panel = null;
    this._buttons.clear();
    super.destroy();
  }
}
