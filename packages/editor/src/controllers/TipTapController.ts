import type { Editor } from '@tiptap/core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { ContextConsumer } from '@lit/context';
import { tiptapContext } from '@/context/tiptapContext.ts';

export class TipTapController implements ReactiveController {
  private host: ReactiveControllerHost;
  private unbindTransaction?: () => void;
  // @ts-expect-error TypeScript cannot infer the type correctly here
  private editorConsumer: ContextConsumer<{ __context__: Editor | undefined }, ReactiveControllerHost & HTMLElement>;
  public _editor: Editor | undefined;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);

    // Automatically consume the editor from context
    this.editorConsumer = new ContextConsumer(host, {
      callback: (editor?: Editor) => {
        this.handleEditorChange(editor);
      },
      context: tiptapContext,
      subscribe: true,
    });
  }

  get editor(): Editor | undefined {
    return this._editor;
  }

  private handleEditorChange(editor?: Editor) {
    // Clean up existing listener
    this.unbindTransaction?.();
    if (editor) {
      this._editor = editor;
      // @ts-expect-error TipTap's on method returns a function to unbind the listener
      this.unbindTransaction = editor.on('transaction', () => {
        this.host.requestUpdate();
      });
    }
  }

  hostConnected() {
    // Context consumer handles the subscription
  }

  hostDisconnected() {
    this.unbindTransaction?.();
  }
}
