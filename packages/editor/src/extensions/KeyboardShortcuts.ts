import { Extension } from '@tiptap/core';
import { CustomEvents } from '@/events';

export default Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      'Alt-F10': () => {
        globalThis.dispatchEvent(
          new CustomEvent(CustomEvents.FOCUS_TOOLBAR, {
            bubbles: true,
            composed: true,
          }),
        );
        return true;
      },
    };
  },
});
