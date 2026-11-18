import type { CoreValidationRule } from '@nl-design-system-community/clippy-a11y-validator';
import type { Locale } from '../i18n/translations.ts';

export interface ValidationGroup {
  label: Record<Locale, string>;
  rules: Array<{ example: Record<Locale, string>; rule: CoreValidationRule }>;
  slug: Record<Locale, string>;
}

/**
 * The core validations by the component they check, each with example content that triggers it.
 * An example editor runs only its own rule, so the rest of the example markup stays unflagged.
 */
export const validationGroups: ValidationGroup[] = [
  {
    label: { en: 'Heading', nl: 'Kop' },
    rules: [
      {
        example: {
          en: `
          <h1>Heading level 1</h1>
          <h3>Heading level 3</h3>
          <p>Skipping a level is not allowed!</p>
        `,
          nl: `
          <h1>Kopniveau 1</h1>
          <h3>Kopniveau 3</h3>
          <p>Een niveau overslaan is niet de bedoeling!</p>
        `,
        },
        rule: 'HEADING_LEVEL_MUST_NOT_SKIP',
      },
      {
        example: {
          en: `
          <h1>Heading level 1</h1>
          <h1>Heading level 1 again</h1>
        `,
          nl: `
          <h1>Kopniveau 1</h1>
          <h1>Kopniveau 2</h1>
        `,
        },
        rule: 'HEADING_LEVEL_ONE_MUST_BE_UNIQUE',
      },
      {
        example: {
          en: `
          <h1>Apply for a passport</h1>
          <h2></h2>
          <p>Make an appointment with the municipality.</p>
        `,
          nl: `
          <h1>Paspoort aanvragen</h1>
          <h2></h2>
          <p>Maak een afspraak bij de gemeente.</p>
        `,
        },
        rule: 'HEADING_MUST_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <h2>Heading level 2</h2>
          <p>The document does not start with a main heading.</p>
        `,
          nl: `
          <h2>Kopniveau 2</h2>
          <p>Het document begint niet met een hoofdkop.</p>
        `,
        },
        rule: 'HEADING_MUST_START_AT_LEVEL_ONE',
      },
      {
        example: {
          en: `
          <h1>Heading with <strong>bold</strong></h1>
          <p>...</p>
          <h1>Heading with <em>italic</em></h1>
          <p>...</p>
        `,
          nl: `
          <h1>Heading met <strong>bold</strong></h1>
          <p>...</p>
          <h1>Heading met <em>italic</em></h1>
          <p>...</p>
        `,
        },
        rule: 'HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC',
      },
    ],
    slug: { en: 'heading', nl: 'kop' },
  },
  {
    label: { en: 'Paragraph', nl: 'Alinea' },
    rules: [
      {
        example: {
          en: `
          <p>Hi,</p>
          <p>&nbsp;</p>
          <p>Kind regards,</p>
          <p>Robbert</p>
        `,
          nl: `
          <p>Hoi,</p>
          <p>&nbsp;</p>
          <p>Groetjes,</p>
          <p>Robbert</p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <p><strong>The application takes five working days. You will get an email once the municipality has assessed your application.</strong></p>
        `,
          nl: `
          <p><strong>De aanvraag duurt vijf werkdagen. Je krijgt bericht per e-mail zodra de gemeente je aanvraag heeft beoordeeld.</strong></p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD',
      },
      {
        example: {
          en: `
          <p><em>The application takes five working days. You will get an email once the municipality has assessed your application.</em></p>
        `,
          nl: `
          <p><em>De aanvraag duurt vijf werkdagen. Je krijgt bericht per e-mail zodra de gemeente je aanvraag heeft beoordeeld.</em></p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_ITALIC',
      },
      {
        example: {
          en: `
          <h2>Bold</h2>
          <p>Empty Bold: <b>&nbsp;</b></p>
          <p>Bold with text: <b>text</b></p>
          <h2>Underline</h2>
          <p>Empty Underline: <u>&nbsp;</u></p>
          <p>Underline with text: <u>text</u></p>
          <h2>Strong</h2>
          <p>Empty Strong: <strong>&nbsp;</strong></p>
          <p>Strong with text: <strong>text</strong></p>
          <h2>Mark</h2>
          <p>Empty Mark: <mark>&nbsp;</mark></p>
          <p>Mark with text: <mark>text</mark></p>
          <h2>Emphasis</h2>
          <p>Empty Emphasis: <em>&nbsp;</em></p>
          <p>Emphasis with text: <em>text</em></p>
          <h2>Strikethrough</h2>
          <p>Empty Strikethrough: <s>&nbsp;</s></p>
          <p>Strikethrough with text: <s>text</s></p>
          <h2>Italic</h2>
          <p>Empty Italic: <i>&nbsp;</i></p>
          <p>Italic with text: <i>text</i></p>
        `,
          nl: `
          <h2>Bold</h2>
          <p>Empty Bold: <b>&nbsp;</b></p>
          <p>Bold with text: <b>text</b></p>
          <h2>Underline</h2>
          <p>Empty Underline: <u>&nbsp;</u></p>
          <p>Underline with text: <u>text</u></p>
          <h2>Strong</h2>
          <p>Empty Strong: <strong>&nbsp;</strong></p>
          <p>Strong with text: <strong>text</strong></p>
          <h2>Mark</h2>
          <p>Empty Mark: <mark>&nbsp;</mark></p>
          <p>Mark with text: <mark>text</mark></p>
          <h2>Emphasis</h2>
          <p>Empty Emphasis: <em>&nbsp;</em></p>
          <p>Emphasis with text: <em>text</em></p>
          <h2>Strikethrough</h2>
          <p>Empty Strikethrough: <s>&nbsp;</s></p>
          <p>Strikethrough with text: <s>text</s></p>
          <h2>Italic</h2>
          <p>Empty Italic: <i>&nbsp;</i></p>
          <p>Italic with text: <i>text</i></p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING',
      },
      {
        example: {
          en: `
          <p>Bring your passport.<br /><br />Pay at the desk with your debit card.</p>
        `,
          nl: `
          <p>Neem je paspoort mee.<br /><br />Betaal aan de balie met je pinpas.</p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_CONTAIN_MULTIPLE_TEXT_BLOCKS',
      },
      {
        example: {
          en: `
          <p>
            There is insufficient difference between the underline of an <u>underline</u> and a <a href="#">link</a>.
          </p>
        `,
          nl: `
          <p>Er is onvoldoende verschil tussen de onderstreping van een <u>underline</u> en <a href="#">link</a>.</p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT',
      },
      {
        example: {
          en: `
          <p><strong>If it looks like a heading, it should be a heading</strong></p>
          <p>Foo</p>
        `,
          nl: `
          <p><strong>Als het eruit ziet als een header, dan is het een header</strong></p>
          <p>Foo</p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING',
      },
      {
        example: {
          en: `
          <p>1. Option 1<br />2. Option 2<br />3. Option 3</p>
          <p>- Option 1<br />- Option 2<br />- Option 3</p>
        `,
          nl: `
          <p>1. Optie 1<br />2. Optie 2<br />3. Optie 3</p>
          <p>- Optie 1<br />- Optie 2<br />- Optie 3</p>
        `,
        },
        rule: 'PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST',
      },
    ],
    slug: { en: 'paragraph', nl: 'alinea' },
  },
  {
    label: { en: 'Link', nl: 'Link' },
    rules: [
      {
        example: {
          en: `
          <p>Empty Link: <a href="#">&nbsp;</a></p>
          <p>Link with text: <a href="#">text</a></p>
        `,
          nl: `
          <p>Empty Link: <a href="#">&nbsp;</a></p>
          <p>Link with text: <a href="#">text</a></p>
        `,
        },
        rule: 'LINK_SHOULD_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <p>
            Read more about why link text matters, in the blog post "<a href="https://example.com/blog/click-here"
              >click here</a
            >".
          </p>
        `,
          nl: `
          <p>
            Lees meer waarom een linktekst zo belangrijk is, in de blogpost "<a
              href="https://example.com/blog/klik-hier">klik hier</a
            >".
          </p>
        `,
        },
        rule: 'LINK_SHOULD_NOT_BE_TOO_GENERIC',
      },
    ],
    slug: { en: 'link', nl: 'link' },
  },
  {
    label: { en: 'Unordered list', nl: 'Ongenummerde lijst' },
    rules: [
      {
        example: {
          en: `
          <ul>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
            <li></li>
          </ul>
        `,
          nl: `
          <ul>
            <li>Optie 1</li>
            <li>Optie 2</li>
            <li>Optie 3</li>
            <li></li>
          </ul>
        `,
        },
        rule: 'UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY',
      },
    ],
    slug: { en: 'unordered-list', nl: 'ongenummerde-lijst' },
  },
  {
    label: { en: 'Ordered list', nl: 'Genummerde lijst' },
    rules: [
      {
        example: {
          en: `
          <ol>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
            <li></li>
          </ol>
        `,
          nl: `
          <ol>
            <li>Optie 1</li>
            <li>Optie 2</li>
            <li>Optie 3</li>
            <li></li>
          </ol>
        `,
        },
        rule: 'ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY',
      },
    ],
    slug: { en: 'ordered-list', nl: 'genummerde-lijst' },
  },
  {
    label: { en: 'Description list', nl: 'Definitielijst' },
    rules: [
      {
        example: {
          en: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">First definition</dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">Second definition</dd>
            </div>
          </dl>
        `,
          nl: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">Eerste definitie</dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">Tweede definitie</dd>
            </div>
          </dl>
        `,
        },
        rule: 'DESCRIPTION_LIST_MUST_CONTAIN_TERM',
      },
      {
        example: {
          en: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail"></dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title">text</dt>
              <dd class="denhaag-description-list__detail">text</dd>
            </div>
          </dl>
        `,
          nl: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail"></dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title">text</dt>
              <dd class="denhaag-description-list__detail">text</dd>
            </div>
          </dl>
        `,
        },
        rule: 'DESCRIPTION_SHOULD_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">Description without a term</dd>
            </div>
          </dl>
        `,
          nl: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail">Beschrijving zonder term</dd>
            </div>
          </dl>
        `,
        },
        rule: 'DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION',
      },
      {
        example: {
          en: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail"></dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title">text</dt>
              <dd class="denhaag-description-list__detail">text</dd>
            </div>
          </dl>
        `,
          nl: `
          <dl class="denhaag-description-list">
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title"></dt>
              <dd class="denhaag-description-list__detail"></dd>
            </div>
            <div class="denhaag-description-list-item">
              <dt class="denhaag-description-list__title">text</dt>
              <dd class="denhaag-description-list__detail">text</dd>
            </div>
          </dl>
        `,
        },
        rule: 'DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY',
      },
    ],
    slug: { en: 'description-list', nl: 'definitielijst' },
  },
  {
    label: { en: 'Table', nl: 'Tabel' },
    rules: [
      {
        example: {
          en: `
          <table>
            <caption></caption>
            <thead>
              <tr>
                <th>Product</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Passport</td>
                <td>€ 84</td>
              </tr>
            </tbody>
          </table>
        `,
          nl: `
          <table>
            <caption></caption>
            <thead>
              <tr>
                <th>Product</th>
                <th>Kosten</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Paspoort</td>
                <td>€ 84</td>
              </tr>
            </tbody>
          </table>
        `,
        },
        rule: 'TABLE_CAPTION_SHOULD_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <table>
            <tbody>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
            </tbody>
          </table>
        `,
          nl: `
          <table>
            <tbody>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
            </tbody>
          </table>
        `,
        },
        rule: 'TABLE_CELL_SHOULD_NOT_BE_EMPTY',
      },
      {
        example: {
          en: `
          <table>
            <thead>
              <tr>
                <td colspan="4">Table heading</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Row 1, cell 1</td>
                <td>Row 1, cell 2</td>
                <td>Row 1, cell 3</td>
                <td>Row 1, cell 4</td>
              </tr>
            </tbody>
          </table>
        `,
          nl: `
          <table>
            <thead>
              <tr>
                <td colspan="4">Tabelkop</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rij 1, cel 1</td>
                <td>Rij 1, cel 2</td>
                <td>Rij 1, cel 3</td>
                <td>Rij 1, cel 4</td>
              </tr>
            </tbody>
          </table>
        `,
        },
        rule: 'TABLE_MUST_HAVE_HEADINGS',
      },
      {
        example: {
          en: `
          <table>
            <tbody>
              <tr>
                <td>
                  <h2>Column 1</h2>
                  <p>...</p>
                </td>
                <td>
                  <h2>Column 2</h2>
                  <p>...</p>
                </td>
              </tr>
            </tbody>
          </table>
        `,
          nl: `
          <table>
            <tbody>
              <tr>
                <td>
                  <h2>Kolom 1</h2>
                  <p>...</p>
                </td>
                <td>
                  <h2>Kolom 2</h2>
                  <p>...</p>
                </td>
              </tr>
            </tbody>
          </table>
        `,
        },
        rule: 'TABLE_MUST_HAVE_MULTIPLE_ROWS',
      },
    ],
    slug: { en: 'table', nl: 'tabel' },
  },
  {
    label: { en: 'Image', nl: 'Afbeelding' },
    rules: [
      {
        example: {
          en: `
          <p><img src="https://placehold.co/320x240" /></p>
        `,
          nl: `
          <p><img src="https://placehold.co/320x240" /></p>
        `,
        },
        rule: 'IMAGE_MUST_HAVE_ALT_TEXT',
      },
    ],
    slug: { en: 'image', nl: 'afbeelding' },
  },
];
