import type { Editor } from "@tiptap/core";
import { consume } from "@lit/context";
import BoldIcon from "@tabler/icons/outline/bold.svg?raw";
import ItalicIcon from "@tabler/icons/outline/italic.svg?raw";
import "./ToolbarButton";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import type { ComboBoxOption } from "../components/combo-box/types.ts";
import { tiptapContext } from "../context/TiptapContext.ts";
import toolbarStyles from "./styles.ts";
import { CustomEvents } from "../events";

const addAriaHidden = (svg: string) => svg.replace("<svg", '<svg aria-hidden="true"');

@customElement("clippy-toolbar")
export class Toolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  @state()
  private get options(): ComboBoxOption[] {
    return [
      {
        active: this.editor?.isActive("heading", { level: 1 }) ?? false,
        label: "Kopniveau 1",
        value: "h1",
      },
      {
        active: this.editor?.isActive("heading", { level: 2 }) ?? false,
        label: "Kopniveau 2",
        value: "h2",
      },
      {
        active: this.editor?.isActive("heading", { level: 3 }) ?? false,
        label: "Kopniveau 3",
        value: "h3",
      },
      {
        active: this.editor?.isActive("paragraph") ?? false,
        label: "Paragraaf",
        value: "paragraph",
      },
    ];
  }

  static override readonly styles = [toolbarStyles];

  readonly #onUpdate = () => this.requestUpdate();

  // TODO: barf, find a better way to do this
  readonly #handleTextFormatChange = (event) => {
    switch (event.detail.value) {
      case "h1":
        this.editor?.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        this.editor?.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        this.editor?.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "paragraph":
        this.editor?.chain().focus().setParagraph().run();
        break;
      default:
        break;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(CustomEvents.TEXT_FORMAT_CHANGE, this.#handleTextFormatChange);
    this.editor?.on("transaction", this.#onUpdate);
  }

  override disconnectedCallback() {
    this.editor?.off("transaction", this.#onUpdate);
    window.removeEventListener(CustomEvents.TEXT_FORMAT_CHANGE, this.#handleTextFormatChange);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-combo-box .options=${this.options}></clippy-combo-box>
        <clippy-toolbar-button
          label="Bold"
          .pressed=${this.editor?.isActive("bold") ?? false}
          @click=${() => this.editor?.chain().focus().setBold().run()}
        >
          ${unsafeSVG(addAriaHidden(BoldIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Italic"
          .pressed=${this.editor?.isActive("italic") ?? false}
          @click=${() => this.editor?.chain().focus().setItalic().run()}
        >
          ${unsafeSVG(addAriaHidden(ItalicIcon))}
        </clippy-toolbar-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "clippy-toolbar": Toolbar;
  }
}
