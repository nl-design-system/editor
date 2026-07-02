import { Extension, type CommandProps, Node, type Editor } from '@tiptap/core';
import { type NodeType } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    definitionList: {
      insertDefinitionList: () => ReturnType;
    };
  }
}

const insertItemAfter = (editor: Editor): boolean => {
  const { state } = editor.view;
  const { schema, selection } = state;
  const { $from } = selection;

  let itemDepth = -1;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type === schema.nodes['definitionListItem']) {
      itemDepth = depth;
      break;
    }
  }
  if (itemDepth === -1) return false;

  const item = $from.node(itemDepth);
  const itemPos = $from.before(itemDepth);
  const insertPos = itemPos + item.nodeSize;

  const newItem = schema.nodes['definitionListItem'].createAndFill();
  if (!newItem) return false;

  const tr = state.tr.insert(insertPos, newItem);
  // insertPos + 1 = inside definitionListItem, insertPos + 2 = inside definitionTerm
  tr.setSelection(TextSelection.create(tr.doc, insertPos + 2));
  tr.scrollIntoView();
  editor.view.dispatch(tr);
  return true;
};

function removeItemIfEmpty(editor: Editor): boolean {
  const { state } = editor.view;
  const { schema, selection } = state;
  const { $from } = selection;

  if ($from.parent.content.size > 0) return false;

  let itemDepth = -1;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type === schema.nodes['definitionListItem']) {
      itemDepth = depth;
      break;
    }
  }
  if (itemDepth === -1) return false;

  // Keep at least one item to satisfy the definitionList content constraint
  if ($from.node(itemDepth - 1).childCount <= 1) return false;

  const item = $from.node(itemDepth);
  const itemPos = $from.before(itemDepth);

  const tr = state.tr.delete(itemPos, itemPos + item.nodeSize);
  editor.view.dispatch(tr);
  return true;
}

function createDefinitionNodeShortcuts(nodeType: NodeType) {
  const guard = (editor: Editor) => {
    const { $from, empty: selectionEmpty } = editor.view.state.selection;
    return selectionEmpty && $from.parent.type === nodeType;
  };

  return {
    Backspace: ({ editor }: { editor: Editor }) => {
      if (!guard(editor)) return false;
      return removeItemIfEmpty(editor);
    },
    Delete: ({ editor }: { editor: Editor }) => {
      if (!guard(editor)) return false;
      return removeItemIfEmpty(editor);
    },
    Enter: ({ editor }: { editor: Editor }) => {
      if (!guard(editor)) return false;
      return insertItemAfter(editor);
    },
  };
}

const DefinitionListNode = Node.create({
  name: 'definitionList',
  content: 'definitionListItem+',
  group: 'block',
  parseHTML() {
    return [{ tag: 'div.denhaag-description-list-container' }, { tag: 'dl' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'denhaag-description-list-container' },
      ['dl', { class: 'denhaag-description-list', ...HTMLAttributes }, 0],
    ];
  },
});

const DefinitionListItemNode = Node.create({
  name: 'definitionListItem',
  content: 'definitionTerm definitionDescription+',
  parseHTML() {
    return [{ tag: 'div.denhaag-description-list-item' }];
  },
  renderHTML() {
    return ['div', { class: 'denhaag-description-list-item' }, 0];
  },
});

const DefinitionTermNode = Node.create({
  name: 'definitionTerm',
  addKeyboardShortcuts() {
    return createDefinitionNodeShortcuts(this.type);
  },
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'dt' }];
  },
  renderHTML() {
    return ['dt', { class: 'denhaag-description-list__title' }, 0];
  },
});

const DefinitionDescriptionNode = Node.create({
  name: 'definitionDescription',
  addKeyboardShortcuts() {
    return createDefinitionNodeShortcuts(this.type);
  },
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'dd' }];
  },
  renderHTML() {
    return ['dd', { class: 'denhaag-description-list__detail' }, 0];
  },
});

export const DefinitionList = Extension.create({
  name: 'definitionListExtension',

  addCommands() {
    return {
      insertDefinitionList:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            content: [
              {
                content: [
                  {
                    content: [{ text: 'Voorbeeld term', type: 'text' }],
                    type: 'definitionTerm',
                  },
                  {
                    content: [{ text: 'Voorbeeld beschrijving', type: 'text' }],
                    type: 'definitionDescription',
                  },
                ],
                type: 'definitionListItem',
              },
            ],
            type: 'definitionList',
          });
        },
    };
  },

  addExtensions() {
    return [DefinitionListNode, DefinitionListItemNode, DefinitionTermNode, DefinitionDescriptionNode];
  },
});
