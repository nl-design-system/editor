import { Extension } from '@tiptap/core';
import { CustomEvents } from '@/events';
import { debouncedValidate, runValidation } from '@/validators';

export default Extension.create({
  name: 'validation',

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-t': () => {
        const event = new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
          bubbles: true,
          composed: true,
          detail: { identifier: this.options.identifier },
        });
        globalThis.dispatchEvent(event);
        return true;
      },
    };
  },

  onCreate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    runValidation(editor.view.dom, settings, updateValidationsContext);
  },

  onUpdate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    if (editor.isDestroyed || !editor.view) return;
    try {
      debouncedValidate(editor.view.dom, settings, updateValidationsContext);
    } catch {
      // view may not be available during editor lifecycle transitions
    }
  },
});
