import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { Editor } from '@tiptap/core';
import type { ClippyHubController } from '@/controllers/ClippyHubController';
import { editorExtensions } from '@/extensions';

export interface TiptapEditorControllerOptions {
  editable: () => boolean;
  hub: ClippyHubController;
  identifier: () => string;
}

export class TiptapEditorController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #options: TiptapEditorControllerOptions;
  #html?: string;
  #editor?: Editor;

  constructor(host: ReactiveControllerHost, options: TiptapEditorControllerOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  get editor(): Editor | undefined {
    return this.#editor;
  }

  create(content: string): void {
    this.#html = content;
    const { editable, hub, identifier } = this.#options;
    this.#editor = new Editor({
      content,
      editable: editable(),
      editorProps: {
        attributes: {
          class: 'clippy-content',
        },
      },
      element: null,
      extensions: editorExtensions({
        identifier: identifier(),
        readonly: false,
        scheduleValidation: hub.scheduleValidation,
        validate: hub.validate,
      }),
      onMount: ({ editor }) => {
        hub.connect(editor.view.dom);
      },
    });
    this.#host.requestUpdate();
  }

  setEditable(editable: boolean): void {
    this.#editor?.setEditable(editable);
  }

  hostConnected(): void {
    if (this.#html !== undefined && !this.#editor) {
      this.create(this.#html);
    }
  }

  hostDisconnected(): void {
    if (!this.#editor) return;
    this.#html = this.#editor.getHTML();
    this.#editor.destroy();
    this.#editor = undefined;
  }
}
