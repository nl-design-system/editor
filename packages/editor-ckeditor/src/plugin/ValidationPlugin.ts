import { Plugin } from 'ckeditor5';
import type { Element } from 'ckeditor5';
import type { BoundingBox, ValidationResult } from '../types/index.ts';
import { runValidation } from '../validators/index.ts';

export class ValidationPlugin extends Plugin {
  private _results: ValidationResult[] = [];

  get results(): ValidationResult[] {
    return this._results;
  }

  init(): void {
    this.editor.model.document.on('change:data', () => this.validate());
    this.editor.on('ready', () => {
      const editableEl = this.editor.ui.getEditableElement();
      if (editableEl) {
        new ResizeObserver(() => this._refreshBoundingBoxes()).observe(editableEl);
      }
      this.validate();
    });
  }

  validate(): void {
    const root = this.editor.model.document.getRoot();
    if (!root) {
      return;
    }

    this._results = runValidation(root).map((result) => ({
      ...result,
      boundingBox: this._getBoundingBox(result.element),
    }));

    this.editor.fire('validation:results', this._results);
  }

  private _refreshBoundingBoxes(): void {
    this._results = this._results.map((result) => ({
      ...result,
      boundingBox: this._getBoundingBox(result.element),
    }));
    this.editor.fire('validation:results', this._results);
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

    const { top, height } = domElement.getBoundingClientRect();
    return { top, height };
  }
}
