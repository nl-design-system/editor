import { Alert } from '@rijkshuisstijl-community/components-react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, type ReactNodeViewProps } from '@tiptap/react';

const alertTypes: Array<'info' | 'warning' | 'error' | 'ok'> = ['info', 'warning', 'error', 'ok'];

function AlertNodeView({ node, updateAttributes }: ReactNodeViewProps<HTMLDivElement>) {
  const type = node.attrs['type'] || 'info';
  return (
    <NodeViewWrapper as="div">
      <select value={type} onChange={(e) => updateAttributes({ type: e.target.value as 'info' | 'warning' | 'error' })}>
        {alertTypes.map((alertType) => (
          <option key={alertType} value={alertType}>
            {alertType}
          </option>
        ))}
      </select>
      <Alert type={type}>
        <NodeViewContent as="div" />
      </Alert>
    </NodeViewWrapper>
  );
}
export interface AlertOptions {
  type: 'info' | 'warning' | 'error' | 'ok';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alert: {
      setAlert: (type: AlertOptions['type']) => ReturnType;
    };
  }
}

const AlertNode = Node.create<AlertOptions>({
  name: 'alert',
  addAttributes() {
    return {
      type: {
        default: this.options.type,
      },
    };
  },
  addCommands() {
    return {
      setAlert:
        (type) =>
        ({ commands }) => {
          return commands.insertContent({
            attrs: { type },
            content: [
              {
                attrs: { level: 2 },
                content: [{ text: 'Alert koptekst', type: 'text' }],
                type: 'heading',
              },
              {
                content: [
                  {
                    text: 'Beschrijving van deze Alert',
                    type: 'text',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: this.name,
          });
        },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(AlertNodeView);
  },
  addOptions() {
    return {
      type: 'info',
    };
  },
  content: 'heading paragraph',
  group: 'block',
  parseHTML() {
    return [
      {
        tag: 'div',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

export default AlertNode;
