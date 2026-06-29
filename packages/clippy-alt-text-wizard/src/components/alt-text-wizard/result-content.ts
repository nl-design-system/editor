import { msg } from '@lit/localize';
import { html } from 'lit';
import type { AltTextWizardResultState, AltTextWizardState } from '@/state-machine.ts';

export interface ResultStepContent {
  documentationUrl: string;
  instructions: unknown;
  title: unknown;
}

/**
 * Returns the content map for all result steps.
 * Must be called inside `render()` so `msg()` resolves in the correct `@localized()` context.
 */
export function getResultContent(): ReadonlyMap<AltTextWizardState, ResultStepContent> {
  return new Map<AltTextWizardResultState, ResultStepContent>([
    [
      'result_ambient',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/decoratieve-afbeeldingen/',
        instructions: html`<p class="nl-paragraph">
          ${msg(
            'This image sets the mood but does not contain unique information. Set the alt attribute to empty (alt="") or use a brief description that conveys the mood.',
          )}
        </p>`,
        title: msg('Ambient image'),
      },
    ],
    [
      'result_clickableLogo',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/functionele-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">${msg('The alt text must:')}</p>
          <ul class="utrecht-unordered-list">
            <li class="utrecht-unordered-list__item">${msg('Contain the text of the logo.')}</li>
            <li class="utrecht-unordered-list__item">${msg('Clearly indicate the destination.')}</li>
          </ul>
          <p class="nl-paragraph">${msg('Example of a logo that is also a link to the homepage:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<a href="...">\n  <img alt="${msg('Example Municipality, go to homepage')}" src="..." />\n</a>`}</code></pre>
        `,
        title: msg('Solution for clickable logo'),
      },
    ],
    [
      'result_complexInformative',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/informatieve-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">${msg(html`For complex images you need <strong>two</strong> text alternatives:`)}</p>
          <h4 class="nl-heading nl-heading--level-4">${msg('1. Short alt text')}</h4>
          <p class="nl-paragraph">${msg('Refer to the detailed description.')}</p>
          <p class="nl-paragraph">${msg('For example:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<img src="..." alt="${msg('Number of visitors in 2024, chart. Full description below the image.')}">`}</code></pre>
          <h4 class="nl-heading nl-heading--level-4">${msg('2. Detailed explanation')}</h4>
          <p class="nl-paragraph">${msg('Place below the image:')}</p>
          <ul class="utrecht-unordered-list">
            <li class="utrecht-unordered-list__item">${msg('full text description, or')}</li>
            <li class="utrecht-unordered-list__item">${msg('data table, or')}</li>
            <li class="utrecht-unordered-list__item">${msg('downloadable file')}</li>
          </ul>
        `,
        title: msg('Solution for complex informative images'),
      },
    ],
    [
      'result_decorative',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/decoratieve-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">${msg('Use one of these options:')}</p>
          <h4 class="nl-heading nl-heading--level-4">${msg(html`For an <code class="nl-code">&lt;img&gt;</code>`)}</h4>
          <p class="nl-paragraph">${msg('Use alt="".')}</p>
          <p class="nl-paragraph">${msg('For example:')}</p>
          <pre class="nl-code-block"><code class="nl-code-block__code">${'<img src="..." alt="">'}</code></pre>
          <h4 class="nl-heading nl-heading--level-4">${msg(html`For an <code class="nl-code">&lt;svg&gt;</code>`)}</h4>
          <p class="nl-paragraph">
            ${msg(
              html`Remove the <code class="nl-code">&lt;title&gt;</code> and
                <code class="nl-code">&lt;desc&gt;</code> elements or add aria-hidden="true".`,
            )}
          </p>
          <p class="nl-paragraph">${msg('For example:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${'<svg aria-hidden="true" focusable="false" ...>\n  <path d="..." />\n</svg>'}</code></pre>
        `,
        title: msg('Solution for decorative images'),
      },
    ],
    [
      'result_functionalWithSupplementaryText',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/functionele-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">
            ${msg(
              'The solution depends on the supplementary visible text. Does it already provide sufficient explanation or not.',
            )}
          </p>
          <h4 class="nl-heading nl-heading--level-4">${msg('Text provides sufficient explanation')}</h4>
          <p class="nl-paragraph">${msg('Use alt="".')}</p>
          <p class="nl-paragraph">${msg('Example for a button:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<button type="search">\n  <img src="..." alt="..."/>\n  ${msg('Search')}\n</button>`}</code></pre>
          <p class="nl-paragraph">${msg('Example for a link:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<a href="...">\n  <img alt="..." src="..." />\n  ${msg('Download annual report 2024 as PDF')}\n</a>`}</code></pre>
          <h4 class="nl-heading nl-heading--level-4">${msg('Text does not provide sufficient explanation')}</h4>
          <p class="nl-paragraph">
            ${msg(
              html`Provide a short, clear alt text that describes the <strong>function</strong> and not the appearance.`,
            )}
          </p>
          <p class="nl-paragraph">${msg('Example for a link:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<a href="...">\n  <img alt="PDF" src="..." />\n  ${msg('Download annual report 2024')}\n</a>`}</code></pre>
        `,
        title: msg('Solution for functional images supplemented with text'),
      },
    ],
    [
      'result_functionalWithText',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/tekst-in-afbeelding/',
        instructions: html`
          <p class="nl-paragraph">${msg('Provide a short, clear alt text that conveys the important information.')}</p>
          <p class="nl-paragraph">${msg('For example:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<img src="..." alt="${msg("Poster with the text 'Freedom for everyone' in handwritten style")}">`}</code></pre>
        `,
        title: msg('Solution for images of text'),
      },
    ],
    [
      'result_functionalWithoutText',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/functionele-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">
            ${msg(
              html`Provide a short, clear alt text that describes the <strong>function</strong> and not the appearance.`,
            )}
          </p>
          <p class="nl-paragraph">${msg('Example for a button:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<button type="search">\n  <img src="..." alt="${msg('Search')}"/>\n</button>`}</code></pre>
          <p class="nl-paragraph">${msg('Example for a link:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<a href="...">\n  <img alt="${msg('Download annual report 2024')}" src="..." />\n</a>`}</code></pre>
          <p class="nl-paragraph">${msg('You may also use aria-label="..." if you know what you are doing.')}</p>
        `,
        title: msg('Solution for functional images without text'),
      },
    ],
    [
      'result_logo',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/functionele-afbeeldingen/',
        instructions: html`<p class="nl-paragraph">
          ${msg('Use the company or organization name as alt text. For example: alt="Organization Name".')}
        </p>`,
        title: msg('Logo'),
      },
    ],
    [
      'result_simpleInformative',
      {
        documentationUrl: 'https://nldesignsystem.nl/richtlijnen/content/afbeeldingen/informatieve-afbeeldingen/',
        instructions: html`
          <p class="nl-paragraph">${msg('Provide a short, clear alt text that conveys the important information.')}</p>
          <h4 class="nl-heading nl-heading--level-4">${msg('Options')}</h4>
          <ul class="utrecht-unordered-list">
            <li class="utrecht-unordered-list__item">
              ${msg(html`Alt attribute on <code class="nl-code">&lt;img&gt;</code>.`)}
            </li>
            <li class="utrecht-unordered-list__item">${msg('Text or table directly above or below the image.')}</li>
          </ul>
          <p class="nl-paragraph">${msg('For example:')}</p>
          <pre
            class="nl-code-block"
          ><code class="nl-code-block__code">${`<img src="..." alt="${msg('Bar chart showing visitor growth in 2024. Average per month: 300, highest count is 400 in May.')}">`}</code></pre>
        `,
        title: msg('Solution for simple informative images'),
      },
    ],
  ]);
}
