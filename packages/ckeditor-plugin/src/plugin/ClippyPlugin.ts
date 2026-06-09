import { Plugin } from 'ckeditor5';
import { runValidation, debouncedValidate, type ValidationResult } from '@nl-design-system-community/editor/validators';
import { DEFAULT_SETTINGS } from '../constants/index.ts';
import { toResults } from '../utils/index.ts';

export class ClippyPlugin extends Plugin {
  static get pluginName() {
    return 'ClippyPlugin' as const;
  }

  private _results: ValidationResult[] = [];
  private _editorEl: HTMLElement | null = null;
  private _overlayEl: HTMLElement | null = null;
  private _resultsEl: HTMLElement | null = null;

  init(): void {
    this.editor.on('ready', () => {
      this._setupUI();
      this._validate();
      this.editor.model.document.on('change:data', () => this._debouncedValidate());
    });
  }

  private _setupUI(): void {
    const editableEl = this.editor.ui.getEditableElement();
    this._editorEl = editableEl?.closest<HTMLElement>('.ck-editor') ?? null;
    if (!this._editorEl) {
      return;
    }

    this._overlayEl = document.createElement('div');
    this._overlayEl.className = 'clippy-ckeditor__overlay';
    this._editorEl.append(this._overlayEl);

    this._resultsEl = document.createElement('div');
    this._resultsEl.className = 'clippy-ckeditor__results';
    this._editorEl.append(this._resultsEl);

    new ResizeObserver(() => this._renderOverlays()).observe(editableEl!);
  }

  private _validate(): void {
    const editableEl = this.editor.ui.getEditableElement();
    if (!editableEl) {
      return;
    }

    runValidation(editableEl, DEFAULT_SETTINGS, (resultMap) => {
      this._results = toResults(resultMap);
      this._render();
    });
  }

  private _debouncedValidate(): void {
    const editableEl = this.editor.ui.getEditableElement();
    if (!editableEl) {
      return;
    }

    debouncedValidate(editableEl, DEFAULT_SETTINGS, (resultMap) => {
      this._results = toResults(resultMap);
      this._render();
    });
  }

  private _render(): void {
    if (!this._overlayEl || !this._editorEl || !this._resultsEl) {
      return;
    }
    this._renderOverlays();
    this._renderResults();
  }

  private _renderOverlays(): void {
    this._overlayEl!.innerHTML = '';
    const editorRect = this._editorEl!.getBoundingClientRect();

    this._results.forEach(({ range }) => {
      const boundingBox = this._getBoundingBoxFromRange(range);
      if (!boundingBox) {
        return;
      }

      const item = document.createElement('div');
      item.className = `clippy-ckeditor__overlay-item`;
      item.style.top = `${boundingBox.top - editorRect.top}px`;
      item.style.height = `${boundingBox.height}px`;
      this._overlayEl!.appendChild(item);
    });
  }

  private _renderResults(): void {
    if (this._results.length === 0) {
      this._resultsEl!.innerHTML = 'No errors, well done!';
      return;
    }

    const items = this._results
      .map(
        ({ validatorKey, severity }) => `
        <li>
          <span>${severity}</span>
          <code>${validatorKey}</code>
        </li>`,
      )
      .join('');
    this._resultsEl!.innerHTML = `<ul>${items}</ul>`;
  }

  private _getBoundingBoxFromRange(range: Range | undefined): { top: number; height: number } | null {
    if (!range) {
      return null;
    }

    const { height, top } = range.getBoundingClientRect();
    if (!height) {
      // height is 0 for collapsed/invisible ranges; top can legitimately be 0
      return null;
    }
    return { top, height };
  }
}
