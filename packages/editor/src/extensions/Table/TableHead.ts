import { mergeAttributes, Node } from '@tiptap/core';

export const TableHead = Node.create({
  name: 'tableHead',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'tableRow+',

  parseHTML() {
    return [{ tag: 'thead' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['thead', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  tableRole: 'head',
});
