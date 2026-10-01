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
    const { updateViolationsContext, validations } = this.options;
    runValidation(editor.view.dom, validations, updateViolationsContext);
  },

  onUpdate({ editor }) {
    const { updateViolationsContext, validations } = this.options;
    if (editor.isDestroyed || !editor.view) return;
    try {
      debouncedValidate(editor.view.dom, validations, updateViolationsContext);
    } catch {
      // view may not be available during editor lifecycle transitions
    }
  },
});
