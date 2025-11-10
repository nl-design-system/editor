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
        });
        globalThis.dispatchEvent(event);
        return true;
      },
    };
  },

  onCreate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    runValidation(editor, settings, updateValidationsContext);
  },

  onUpdate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    debouncedValidate(editor, settings, updateValidationsContext);
  },
});
