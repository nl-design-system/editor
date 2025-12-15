import { mergeAttributes, Node } from '@tiptap/core';

export const TableCaption = Node.create({
  name: 'tableCaption',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'inline+',

  parseHTML() {
    return [{ tag: 'caption' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['caption', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  tableRole: 'caption',
});
