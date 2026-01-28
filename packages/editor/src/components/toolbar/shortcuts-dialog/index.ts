import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import CrossIcon from '@tabler/icons/outline/x.svg?raw';
import separatorStyle from '@utrecht/separator-css/dist/index.css?inline';
import tableStyle from '@utrecht/table-css/dist/index.css?inline';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import shortcutsDialogStyles from './styles.ts';

const tag = 'clippy-shortcuts';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ShortcutsDialog;
  }
}

@customElement(tag)
export class ShortcutsDialog extends LitElement {
  @property({ attribute: false })
  public dialogRef?: Ref<HTMLDialogElement>;

  static override readonly styles = [
    shortcutsDialogStyles,
    unsafeCSS(headingStyle),
    unsafeCSS(tableStyle),
    unsafeCSS(separatorStyle),
  ];

  public close(): void {
    this.dialogRef?.value?.close();
  }

  override render() {
    return html`
      <dialog
        closedby="any"
        id="clippy-shortcuts"
        class="clippy-shortcuts__dialog"
        aria-labelledby="clippy-shortcuts-title"
        data-testid="clippy-shortcuts-dialog"
        ${ref(this.dialogRef)}
      >
        <div class="clippy-shortcuts__header">
          <h2 class="nl-heading nl-heading--level-2" id="clippy-shortcuts-title">Sneltoetsen</h2>
          <clippy-button icon-only purpose="subtle" @click=${() => this.close()}>
            <clippy-icon slot="iconStart">${unsafeSVG(CrossIcon)}</clippy-icon>
            Sluit sneltoetsen-dialoogvenster
          </clippy-button>
        </div>
        <table class="utrecht-table utrecht-table--html-table">
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
            <tr>
              <td>Code</td>
              <td><kbd>Control</kbd> + <kbd>E</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>E</kbd></td>
            </tr>
            <tr>
              <td>Markeren</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd></td>
            </tr>
            <tr>
              <td>Superscript</td>
              <td><kbd>Control</kbd> + <kbd>.</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>.</kbd></td>
            </tr>
            <tr>
              <td>Subscript</td>
              <td><kbd>Control</kbd> + <kbd>,</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>,</kbd></td>
            </tr>
          </tbody>
        </table>
        <hr class="utrecht-separator" />
        <table class="utrecht-table utrecht-table--html-table">
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
            <tr>
              <td>Geordende lijst</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd></td>
            </tr>
            <tr>
              <td>Ongeordende lijst</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd></td>
            </tr>
            <tr>
              <td>Citaatblok</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd></td>
            </tr>
          </tbody>
        </table>
        <hr class="utrecht-separator" />
        <table class="utrecht-table utrecht-table--html-table">
          <caption>
            Toegankelijkheid
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
              <td>Toegankelijkheidsmeldingen</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd></td>
              <td><kbd>Command</kbd> + <kbd>Option</kbd> + <kbd>T</kbd></td>
            </tr>
            <tr>
              <td>Focus werkbalk</td>
              <td><kbd>Alt</kbd> + <kbd>F10</kbd></td>
              <td>( <kbd>Fn</kbd> ) + <kbd>Option</kbd> + <kbd>F10</kbd></td>
            </tr>
            <tr>
              <td>Focus plaatselijke werkbalk</td>
              <td><kbd>Control</kbd> + <kbd>F9</kbd></td>
              <td>( <kbd>Fn</kbd> ) + <kbd>Command</kbd> + <kbd>F9</kbd></td>
            </tr>
          </tbody>
        </table>
      </dialog>
    `;
  }
}
