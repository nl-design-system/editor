import { Extension } from '@tiptap/core';
import { CustomEvents, type OpenDocumentOverviewDetail } from '@/events';

export interface ValidationOptions {
  identifier?: string;
  scheduleValidation: (dom: HTMLElement) => void;
  validate: (dom: HTMLElement) => void;
}

export default Extension.create<ValidationOptions>({
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

  addOptions() {
    return {
      scheduleValidation: () => {},
      validate: () => {},
    };
  },

  onCreate({ editor }) {
    this.options.validate(editor.view.dom);
  },

  onUpdate({ editor }) {
    if (editor.isDestroyed || !editor.view) return;
    try {
      this.options.scheduleValidation(editor.view.dom);
    } catch {
      // view may not be available during editor lifecycle transitions
    }
  },
});
