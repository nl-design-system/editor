import { provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { defineCustomElements } from '@utrecht/web-component-library-stencil/loader';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './components/Toolbar';
import './components/Gutter';
import './components/combo-box';
import { tiptapContext } from './context/TiptapContext.ts';
import CustomHeadingNode from './nodes/CustomHeadingNode.ts';
import editorStyles from './styles';
import Validation from './validation';

const EDITOR_ID = 'editor';

export type content = string;

defineCustomElements();

const defaultContent: content = `
<h1>NL Design System Editor kop 1</h1>
<p>Onder die steden, <strong>welke</strong> <i>vanouds</i> aan de <strong><i>grafelijke</i></strong> kroon van Holland gelijk zoovele edelgesteenten flonkerden, en wier macht en rijkdom tot een hechten steun verstrekten aan des Landsheer gezag, was Haarlem, gelijk genoeg bekend is, een der voornaamste. Haar ouderdom verloor zich in den nacht der tijden: ’t zij, dat men haar, met Boxhoorn voor de vroege verblijfplaats der Herulen houde en den naam Haarlem, als een verbastering van Herulen-heim aanmerke: ’t zij, dat men dien, met Langendijk, van den Noorman Hariald afleide: ’t zij, dat men met de oude landskronieken veronderstelle, dat zekere Koning of Vorst, Lem genaamd aan de door hem gestichte stad de benaming van Heer Lems stad, naderhand Haarlem hebbe achtergelaten, of met een lateren taalkenner eenvoudig aanneme, dat het woord harel dezelfde beteekenis hebbe als hard, en door harelheim een harde grond te verstaan zijn – genoeg is het, de juist de onzekerheid van dien naamoorsprong de aloudheid der plaats zelve aanduidt.</p>
<h2>NL Design System Editor kop 2</h2>
<p>Aan den over eener rivier gebouwd, waarvan zij zich als van twee armen bedienen kon, om, aan de eene zijde, het Haarlemmermeer en de daarom gelegen landen, aan de andere hij IJ, en door het IJ, de Zuiderzee te bereiken, had zij van deze gunstige ligging reeds vroeg partij getrokken, om een handel te drijven, die, schoon zich zelden verder uitstrekkende dan de gewesten, welke om die binnenzeeën gelegen waren, haar niettemin gelegenheid gaf, om de voortbrengselen van hare door heel Europa beroemde lakenweverijen te slijten en daardoor aan hare ingezetenen welvaart en aanzien te verschaffen: terwijl zij in hare bierbrouwerijen, die de bewoners der omliggende landstreken met den toenmaals zoo algemeenen drank voorzagen, een niet min voordeeligen tak van bestaan gevonden had, vooral, sedert door een grafelijk besluit het verkoopen van vreemd bier binnen Holland verboden en aan Haarlem alzoo een soort van alleenhandel in het graafschap vergund was.</p>
`;

@customElement('clippy-editor')
export class Editor extends LitElement {
  static override readonly styles = [editorStyles];

  @provide({ context: tiptapContext })
  editor: TiptapEditor = new TiptapEditor({
    content: defaultContent,
    editorProps: {
      attributes: {
        class: 'clippy-editor-content',
      },
    },
    extensions: [Document, Paragraph, Text, CustomHeadingNode, Bold, Italic, Underline, Validation],
  });

  override firstUpdated() {
    const editorEl = this.shadowRoot?.getElementById(EDITOR_ID);
    if (editorEl) {
      this.editor.mount(editorEl);
    }
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <clippy-toolbar></clippy-toolbar>
      <div id=${EDITOR_ID}></div>
      <clippy-gutter></clippy-gutter>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-editor': Editor;
  }
}
