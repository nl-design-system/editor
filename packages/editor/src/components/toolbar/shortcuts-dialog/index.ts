import { localized, msg, str } from '@lit/localize';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import CrossIcon from '@tabler/icons/outline/x.svg?raw';
import separatorStyle from '@utrecht/separator-css/dist/index.css?inline';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import tableStyle from '@utrecht/table-css/dist/index.css?inline';
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

@localized()
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
          <h2 class="nl-heading nl-heading--level-2" id="clippy-shortcuts-title">${msg('Shortcuts')}</h2>
          <clippy-button icon-only purpose="subtle" @click=${() => this.close()}>
            <clippy-icon slot="iconStart">${unsafeSVG(CrossIcon)}</clippy-icon>
            ${msg('Close shortcuts dialog')}
          </clippy-button>
        </div>
        <table class="utrecht-table utrecht-table--html-table">
          <caption>
            ${msg('Structure')}
          </caption>
          <thead>
            <tr>
              <th>${msg('Command')}</th>
              <th>Windows/Linux</th>
              <th>macOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${msg('Bold')}</td>
              <td><kbd>Control</kbd> + <kbd>B</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>B</kbd></td>
            </tr>
            <tr>
              <td>${msg('Italic')}</td>
              <td><kbd>Control</kbd> + <kbd>I</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>I</kbd></td>
            </tr>
            <tr>
              <td>${msg('Underline')}</td>
              <td><kbd>Control</kbd> + <kbd>U</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>U</kbd></td>
            </tr>
            <tr>
              <td>${msg('Strike through')}</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></td>
            </tr>
            <tr>
              <td>${msg('Code')}</td>
              <td><kbd>Control</kbd> + <kbd>E</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>E</kbd></td>
            </tr>
            <tr>
              <td>${msg('Highlight')}</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd></td>
            </tr>
            <tr>
              <td>${msg('Superscript')}</td>
              <td><kbd>Control</kbd> + <kbd>.</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>.</kbd></td>
            </tr>
            <tr>
              <td>${msg('Subscript')}</td>
              <td><kbd>Control</kbd> + <kbd>,</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>,</kbd></td>
            </tr>
          </tbody>
        </table>
        <hr class="utrecht-separator" />
        <table class="utrecht-table utrecht-table--html-table">
          <caption>
            ${msg('Text formatting')}
          </caption>
          <thead>
            <tr>
              <th>${msg('Command')}</th>
              <th>Windows/Linux</th>
              <th>macOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${msg('Paragraph')}</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd></td>
            </tr>
            ${[1, 2, 3, 4, 5, 6].map(
              (level) => html`
                <tr>
                  <td>${msg(str`Heading level ${level}`)}</td>
                  <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>${level}</kbd></td>
                  <td><kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>${level}</kbd></td>
                </tr>
              `,
            )}
            <tr>
              <td>${msg('Ordered list')}</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd></td>
            </tr>
            <tr>
              <td>${msg('Unordered list')}</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd></td>
            </tr>
            <tr>
              <td>${msg('Blockquote')}</td>
              <td><kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd></td>
              <td><kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd></td>
            </tr>
          </tbody>
        </table>
        <hr class="utrecht-separator" />
        <table class="utrecht-table utrecht-table--html-table">
          <caption>
            ${msg('Accessibility')}
          </caption>
          <thead>
            <tr>
              <th>${msg('Command')}</th>
              <th>Windows/Linux</th>
              <th>macOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${msg('Accessibility notifications')}</td>
              <td><kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd></td>
              <td><kbd>Command</kbd> + <kbd>Option</kbd> + <kbd>T</kbd></td>
            </tr>
            <tr>
              <td>${msg('Focus toolbar')}</td>
              <td><kbd>Alt</kbd> + <kbd>F10</kbd></td>
              <td>( <kbd>Fn</kbd> ) + <kbd>Option</kbd> + <kbd>F10</kbd></td>
            </tr>
            <tr>
              <td>${msg('Focus contextual toolbar')}</td>
              <td><kbd>Control</kbd> + <kbd>F9</kbd></td>
              <td>( <kbd>Fn</kbd> ) + <kbd>Command</kbd> + <kbd>F9</kbd></td>
            </tr>
          </tbody>
        </table>
      </dialog>
    `;
  }
}
