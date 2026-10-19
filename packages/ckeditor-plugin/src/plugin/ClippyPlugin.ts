import {
  type AccessibilityNotifications,
  type CloseValidationsDrawerDetail,
  type ValidationsDrawer,
} from '@nl-design-system-community/editor/accessibility-notifications';
import { setDarkColorScheme, watchHostColorScheme } from '@nl-design-system-community/editor/color-scheme';
import { EditorContentWrapper, EditorWrapper } from '@nl-design-system-community/editor/editor-wrapper';
import { CustomEvents, type Gutter, validationInteractionMode } from '@nl-design-system-community/editor/gutter';
import { ClippyHub } from '@nl-design-system-community/editor/hub';
import { type Validation, type Violation, type ViolationsMap } from '@nl-design-system-community/editor/validators';
import { Plugin, View, type Locale, type ObservableChangeEvent, type ToolbarView } from 'ckeditor5';
import { adoptClippyStyles } from '../styles/';
import { findMatchingCorrection, findOccurrenceIndex, runValidations } from '../utils/correction.ts';
import { ContentClasses } from './ContentClasses.ts';

export class ClippyPlugin extends Plugin {
  static get pluginName() {
    return 'ClippyPlugin' as const;
  }

  static get requires() {
    // Ensure the design-system classes are applied to CKEditor content
    return [ContentClasses] as const;
  }

  private _editableEl: HTMLElement | null = null;
  private _editorEl: HTMLElement | null = null;
  private _wrapperEl: EditorWrapper | null = null;
  private _gutterEl: Gutter | null = null;
  private _drawerEl: ValidationsDrawer | null = null;
  private _notificationsView: View | null = null;
  private _hub: ClippyHub | null = null;
  private _violationsMap: ViolationsMap = new Map();
  /** The validations this editor runs. Unset means every core validation. */
  private readonly _validations: readonly Validation[] | undefined;
  private _unwatchColorScheme: (() => void) | null = null;

  // Scope drawer events to this editor so multiple CKEditors on one page don't open each other's drawer.
  private get _identifier(): string {
    return `clippy-ckeditor-${this.editor.id}`;
  }

  init(): void {
    this._registerNotificationsToolbarItem();
    this._observeSourceEditingMode();
    this.editor.on('ready', () => {
      this._setupUI();
      this._hub?.validate();
      this.editor.model.document.on('change:data', () => this._hub?.scheduleValidation());
    });
  }

  private _setupUI(): void {
    this._editableEl = this.editor.ui.getEditableElement() ?? null;
    this._editorEl = this._editableEl?.closest<HTMLElement>('.ck-editor') ?? null;

    if (!this._editorEl || !this._editableEl?.parentElement) {
      return;
    }

    const editorEl = this._editorEl;
    // add theme token scoping for the drupal environment.
    editorEl.classList.add('ma-theme', 'clippy-theme', 'utrecht-theme');
    this._unwatchColorScheme = watchHostColorScheme(editorEl, (colorScheme) =>
      setDarkColorScheme(colorScheme === 'dark', editorEl),
    );
    adoptClippyStyles();

    const wrapper = document.createElement('clippy-editor-wrapper') as EditorWrapper;
    this._editableEl.replaceWith(wrapper);
    this._wrapperEl = wrapper;

    const contentWrapper = document.createElement('clippy-editor-content-wrapper') as EditorContentWrapper;
    contentWrapper.append(this._editableEl);
    wrapper.append(contentWrapper);

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    gutter.mode = validationInteractionMode.DRAWER;
    contentWrapper.append(gutter);
    this._gutterEl = gutter;

    const drawer = document.createElement('clippy-validations-drawer') as ValidationsDrawer;
    wrapper.append(drawer);
    this._drawerEl = drawer;

    this._addNotificationsToolbarItem();

    this._hub = new ClippyHub({
      adaptViolations: (violationsMap) => {
        this._violationsMap = violationsMap;
        return this._patchCorrectionsForCKEditor(violationsMap);
      },
      focusViolation: this._focusViolation,
      identifier: this._identifier,
      target: this._editableEl,
      validations: this._validations,
    });
    this._hub.connect({
      drawer,
      gutter,
      trigger: this._notificationsView?.element as AccessibilityNotifications | null,
    });
  }

  private _registerNotificationsToolbarItem(): void {
    this.editor.ui.componentFactory.add('clippyAccessibilityNotifications', (locale: Locale) => {
      const view = new View(locale);
      view.setTemplate({
        tag: 'clippy-accessibility-notifications',
      });
      this._notificationsView = view;
      return view;
    });
  }

  private _addNotificationsToolbarItem(): void {
    const toolbar = (this.editor.ui.view as Partial<{ toolbar: ToolbarView }>).toolbar;
    if (!toolbar) {
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
        this._setNotificationsDisabled(isSourceEditingMode);
        this._closeValidationsDrawer();
      },
    );
  }

  private _setNotificationsDisabled(disabled: boolean): void {
    const button = this._notificationsView?.element as AccessibilityNotifications | null;
    if (button) {
      button.disabled = disabled;
    }
  }

  private _closeValidationsDrawer(): void {
    globalThis.dispatchEvent(
      new CustomEvent<CloseValidationsDrawerDetail>(CustomEvents.CLOSE_VALIDATIONS_DRAWER, {
        detail: { identifier: this._identifier },
      }),
    );
  }

  private _patchCorrectionsForCKEditor(violationsMap: ViolationsMap): ViolationsMap {
    for (const [range, violation] of violationsMap) {
      const { correction, rule } = violation;
      if (!correction || !rule) {
        continue;
      }

      // Only the fix goes through the model pipeline. Spreading first keeps the already resolved
      // label — replacing the whole correction would silently reset the button to "Correct".
      violation.correction = { ...correction, execute: this._modelCorrectionFactory(correction.execute, rule, range) };
    }
    return violationsMap;
  }

  private _modelCorrectionFactory(originalExecute: () => void, rule: string, range: Range): () => void {
    return () => {
      // create a clean HTML copy via this.editor.getData()
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.editor.getData();
      const modelDataViolationsMap = runValidations(tempDiv, this._validations);

      // A validator can flag multiple spots, get the range's position among correctable violations sharing its rule
      const occurrenceIndex = findOccurrenceIndex(this._violationsMap, range, rule);

      // locate the matching correction in the clean HTML copy
      const target = findMatchingCorrection(modelDataViolationsMap, rule, occurrenceIndex);
      // Bound to a local: TS cannot keep the narrowing across the statements below.
      const targetExecute = target?.correction?.execute;

      if (targetExecute) {
        // apply it and check whether it actually changed the DOM
        const before = tempDiv.innerHTML;
        targetExecute();
        if (tempDiv.innerHTML !== before) {
          // setData uses CKEditor's model pipeline, keeping the undo/redo state valid.
          this.editor.setData(tempDiv.innerHTML);
          return;
        }
      }

      // No matching correction, or it didn't modify the DOM (e.g. open dialog, select range), call original directly.
      originalExecute();
    };
  }

  private readonly _focusViolation = ({ range }: Violation) => {
    if (!range) {
      return;
    }
    const domConverter = this.editor.editing.view.domConverter;

    // from DOM to virtual view layer, without CKEditor injected DOM artifacts.
    const viewRange = domConverter.domRangeToView(range);
    if (!viewRange) {
      return;
    }

    // map view range to model range
    const modelRange = this.editor.editing.mapper.toModelRange(viewRange);

    // set the view selection, triggering a DOM render
    this.editor.model.change((writer) => writer.setSelection(modelRange));
    this.editor.focus();
  };

  override destroy(): void {
    this._hub?.destroy();
    this._unwatchColorScheme?.();
    this._drawerEl?.remove();
    this._gutterEl?.remove();
    // Restore the editable to its original parent so CKEditor's own teardown
    // doesn't have to deal with our extra wrapper elements.
    if (this._wrapperEl && this._editableEl) {
      this._wrapperEl.replaceWith(this._editableEl);
    }
    super.destroy();
  }
}
