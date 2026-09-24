import { Extension } from '@tiptap/core';
import { CustomEvents, type OpenDocumentOverviewDetail } from '@/events';
import { debouncedValidate, runValidation } from '@/validations';

export default Extension.create({
  name: 'validation',

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-t': () => {
        const { identifier } = this.options;
        const event = new CustomEvent<OpenDocumentOverviewDetail>(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
          detail: { identifier, mode: 'validations' },
        });
        globalThis.dispatchEvent(event);
        return true;
      },
    };
  },

  onCreate({ editor }) {
    const { getValidations, updateValidationsContext } = this.options;
    runValidation(editor.view.dom, getValidations(), updateValidationsContext);
  },

  onUpdate({ editor }) {
    const { getValidations, updateValidationsContext } = this.options;
    if (editor.isDestroyed || !editor.view) return;
    try {
      debouncedValidate(editor.view.dom, getValidations(), updateValidationsContext);
    } catch {
      // view may not be available during editor lifecycle transitions
    }
  },
});
