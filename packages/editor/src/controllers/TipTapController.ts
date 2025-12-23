import type { Editor } from '@tiptap/core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { ContextConsumer } from '@lit/context';
import { tiptapContext } from '@/context/tiptapContext.ts';

export class TipTapController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  // @ts-expect-error TypeScript cannot infer the type correctly here
  private readonly editorConsumer: ContextConsumer<
    { __context__: Editor | undefined },
    ReactiveControllerHost & HTMLElement
  >;
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
    if (editor) {
      this._editor = editor;
      editor.on('transaction', () => {
        this.host.requestUpdate();
      });
    }
  }

  hostConnected() {
    // Context consumer handles the subscription
  }

  hostDisconnected() {
    // Context consumer handles the subscription
    if (this._editor) {
      this._editor.off('transaction', () => {
        this.host.requestUpdate();
      });
    }
  }
}
