import { CustomEvents, type FocusNodeEvent, type Gutter } from '@nl-design-system-community/editor/gutter';
import { debouncedValidate, runValidation, type ValidationsMap } from '@nl-design-system-community/editor/validators';
import { Plugin } from 'ckeditor5';
import { DEFAULT_SETTINGS } from '../constants/';
import { findMatchingCorrection, findOccurrenceIndex, runValidations } from '../utils/correction.ts';

export class ClippyPlugin extends Plugin {
  static get pluginName() {
    return 'ClippyPlugin' as const;
  }

  private _editableEl: HTMLElement | null = null;
  private _editorEl: HTMLElement | null = null;
  private _gutterEl: Gutter | null = null;
  private _validationsMap: ValidationsMap = new Map();

  init(): void {
    this.editor.on('ready', () => {
      this._setupUI();
      this._validate();
      this.editor.model.document.on('change:data', () => this._debouncedValidate());
    });
  }

  private _setupUI(): void {
    this._editableEl = this.editor.ui.getEditableElement() ?? null;
    this._editorEl = this._editableEl?.closest<HTMLElement>('.ck-editor') ?? null;

    const gutterContainer = this._editableEl?.parentElement ?? null;
    if (!this._editorEl || !gutterContainer) {
      return;
    }

    const gutter = document.createElement('clippy-validations-gutter') as Gutter;
    gutter.mode = 'tooltip';

    // Temp: add theme token scoping for drupal envirnment
    gutter.classList.add('ma-theme', 'clippy-theme', 'utrecht-theme');
    gutterContainer.append(gutter);
    this._gutterEl = gutter;
    this._editorEl.addEventListener(CustomEvents.FOCUS_NODE, this._handleFocusNode);
  }

  private _validate(): void {
    if (!this._editableEl) {
      return;
    }

    runValidation(this._editableEl, DEFAULT_SETTINGS, (validationsMap: ValidationsMap) => {
      this._validationsMap = validationsMap;
      this._render();
    });
  }

  private _debouncedValidate(): void {
    if (!this._editableEl) {
      return;
    }

    debouncedValidate(this._editableEl, DEFAULT_SETTINGS, (validationsMap: ValidationsMap) => {
      this._validationsMap = validationsMap;
      this._render();
    });
  }

  private _render(): void {
    if (!this._gutterEl || !this._editableEl) {
      return;
    }

    this._gutterEl.validationsMap = this._patchCorrectionsForCKEditor(this._validationsMap);
    this._gutterEl.editorDom = this._editableEl;
  }

  private _patchCorrectionsForCKEditor(validationsMap: ValidationsMap): ValidationsMap {
    for (const [range, result] of validationsMap) {
      const { correct, validatorKey } = result;
      if (!correct || !validatorKey) {
        continue;
      }

      // replace correct functions with model-aware versions that go through editor.setData()
      result.correct = this._modelCorrectionFactory(correct, validatorKey, range);
    }
    return validationsMap;
  }

  private _modelCorrectionFactory(originalCorrect: () => void, validatorKey: string, range: Range): () => void {
    return () => {
      // create a clean HTML copy via this.editor.getData()
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.editor.getData();
      const modelDataValidationsMap = runValidations(tempDiv, DEFAULT_SETTINGS);

      // A validator can flag multiple spots, get the range's position among correctable results sharing its validatorKey
      const occurrenceIndex = findOccurrenceIndex(this._validationsMap, range, validatorKey);

      // locate the matching correction in the clean HTML copy
      const target = findMatchingCorrection(modelDataValidationsMap, validatorKey, occurrenceIndex);

      if (target?.correct) {
        // apply it and check whether it actually changed the DOM
        const before = tempDiv.innerHTML;
        target.correct();
        if (tempDiv.innerHTML !== before) {
          // setData uses CKEditor's model pipeline, keeping the undo/redo state valid.
          this.editor.setData(tempDiv.innerHTML);
          return;
        }
      }

      // No matching correction, or it didn't modify the DOM (e.g. open dialog, select range), call original directly.
      originalCorrect();
    };
  }

  private readonly _handleFocusNode = (event: Event) => {
    const { range } = (event as FocusNodeEvent).detail;
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
    this._editorEl?.removeEventListener(CustomEvents.FOCUS_NODE, this._handleFocusNode);
    super.destroy();
  }
}
