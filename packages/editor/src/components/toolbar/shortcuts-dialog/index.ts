import CrossIcon from '@tabler/icons/outline/x.svg?raw';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import shortcutsDialogStyles from './styles.ts';

@customElement('clippy-shortcuts')
export class Index extends LitElement {
  @property({ attribute: false })
  public dialogRef?: Ref<HTMLDialogElement>;

  static override readonly styles = [shortcutsDialogStyles];

  public close(): void {
    this.dialogRef?.value?.close();
  }

  override render() {
    return html`
      <dialog
        id="clippy-shortcuts"
        class="clippy-shortcuts__dialog"
        aria-labelledby="clippy-shortcuts-title"
        ${ref(this.dialogRef)}
      >
        <div class="clippy-shortcuts__header">
          <h1 id="clippy-shortcuts-title">Sneltoetsen</h1>
          <clippy-toolbar-button @click=${() => this.close()} aria-label="Sluit sneltoetsen dialog">
            ${unsafeSVG(CrossIcon)}
          </clippy-toolbar-button>
        </div>
        <table class="clippy-shortcuts__table">
          <caption>
            Structuur
          </caption>
          <thead>
            <tr>
              <th>Command</th>
              <th>Windows/Linux</th>
              <th>macOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vet</td>
              <td><kbd>Control</kbd> + <kbd>B</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>B</kbd></td>
            </tr>
            <tr>
              <td>Cursief</td>
              <td><kbd>Control</kbd> + <kbd>I</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>I</kbd></td>
            </tr>
            <tr>
              <td>Onderstrepen</td>
              <td><kbd>Control</kbd> + <kbd>U</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>U</kbd></td>
            </tr>
            <tr>
              <td>Doorstrepen</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></td>
            </tr>
          </tbody>
        </table>

        <table class="clippy-shortcuts__table">
          <caption>
            Tekstopmaak
          </caption>
          <thead>
            <tr>
              <th>Commando</th>
              <th>Windows/Linux</th>
              <th>macOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paragraaf</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 1</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 2</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 3</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 4</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 5</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd></td>
            </tr>
            <tr>
              <td>Kopniveau 6</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd></td>
            </tr>
          </tbody>
        </table>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-shortcuts': Index;
  }
}
