import type { Editor } from '@tiptap/core';
import type { ReactiveControllerHost } from 'lit';
import { ContextConsumer } from '@lit/context';
import { tiptapContext } from '@/context/tiptapContext';

export class TipTapController {
  private readonly host: ReactiveControllerHost;
  // @ts-expect-error TypeScript cannot infer the type correctly here
  private readonly editorConsumer: ContextConsumer<
    { __context__: Editor | undefined },
    ReactiveControllerHost & HTMLElement
  >;
  public _editor: Editor | undefined;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;

    this.editorConsumer = new ContextConsumer(host, {
      callback: (editor?: Editor) => {
        this.editor = editor;
      },
      context: tiptapContext,
      subscribe: true,
    });
  }

  get editor(): Editor | undefined {
    return this._editor;
  }

  set editor(editor: Editor | undefined) {
    if (editor === this._editor) return;
    this._editor = editor;
    editor?.on('transaction', () => this.host.requestUpdate());
    this.host.requestUpdate();
  }
}
