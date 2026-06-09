import type { Element } from 'ckeditor5';
import { Plugin } from 'ckeditor5';
import type { BoundingBox, ValidationResult } from '../types/index.ts';
import { runValidation } from '../validators/index.ts';

export class ClippyPlugin extends Plugin {
  static get pluginName() {
    return 'ClippyPlugin' as const;
  }

  private _results: ValidationResult[] = [];
  private _editorEl: HTMLElement | null = null;
  private _overlayEl: HTMLElement | null = null;
  private _resultsEl: HTMLElement | null = null;

  init(): void {
    this.editor.model.document.on('change:data', () => this._validate());
    this.editor.on('ready', () => {
      this._setupUI();
      this._validate();
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

    new ResizeObserver(() => this._refreshBoundingBoxes()).observe(editableEl!);
  }

  private _validate(): void {
    const root = this.editor.model.document.getRoot();
    if (!root) {
      return;
    }

    this._results = runValidation(root).map((result) => ({
      ...result,
      boundingBox: this._getBoundingBox(result.element),
    }));

    this._render();
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

    this._results.forEach(({ boundingBox }) => {
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
        ({ ruleId, severity }) => `
        <li>
          <span>${severity}</span>
          <code>${ruleId}</code>
        </li>`,
      )
      .join('');
    this._resultsEl!.innerHTML = `<ul>${items}</ul>`;
  }

  private _refreshBoundingBoxes(): void {
    this._results = this._results.map((result) => ({
      ...result,
      boundingBox: this._getBoundingBox(result.element),
    }));
    this._renderOverlays();
  }

  private _getBoundingBox(element: Element): BoundingBox | null {
    const viewElement = this.editor.editing.mapper.toViewElement(element);
    if (!viewElement) {
      return null;
    }

    const domElement = this.editor.editing.view.domConverter.mapViewToDom(viewElement);
    if (!(domElement instanceof HTMLElement)) {
      return null;
    }

    const { height, top } = domElement.getBoundingClientRect();
    return { height, top };
  }
}
