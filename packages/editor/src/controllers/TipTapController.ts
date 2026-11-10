import type { Editor } from '@tiptap/core';
import type { ReactiveControllerHost } from 'lit';

export class TipTapController {
  private readonly host: ReactiveControllerHost;
  public _editor: Editor | undefined;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
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
