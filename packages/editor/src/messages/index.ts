import { msg, str } from '@lit/localize';
import paragraphStrongDocs from '@nl-design-system-unstable/documentation/componenten/paragraph/_issues/strong/editor-error.md?raw';
import { html, type TemplateResult } from 'lit';
import { blockValidations, documentValidations, inlineValidations } from '@/constants';

export const contentDocs: Record<string, string> = {
  'paragraph-strong': paragraphStrongDocs,
};

type TipFn = (args?: Record<string, number | string | boolean>) => string | TemplateResult | null;

type BlockValidationKey = (typeof blockValidations)[keyof typeof blockValidations];
type InlineValidationKey = (typeof inlineValidations)[keyof typeof inlineValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = BlockValidationKey | DocumentValidationKey | InlineValidationKey;

type ValidationMessages = {
  [K in ValidationKey]: { customCorrectLabel?: string; description: string; docs?: string; href?: string; tip?: TipFn };
};

export type { ValidationMessages };

export const nodeTypesTranslations = (): Record<string, string> => ({
  bold: msg('bold'),
  definitionDescription: msg('definition description'),
  definitionTerm: msg('definition term'),
  highlight: msg('highlight'),
  italic: msg('italic text'),
  link: msg('link text'),
  listItem: msg('list item'),
  paragraph: msg('paragraph'),
  strike: msg('strike'),
  tableCell: msg('table cell'),
  tableHeader: msg('table header'),
  underline: msg('underline'),
});

export const validationMessages = (): ValidationMessages =>
  ({
    [blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
      description: msg('Definition description must follow a definition term'),
    },
    [blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
      description: msg('Definition list must contain a definition term'),
    },
    [blockValidations.HEADING_MUST_NOT_BE_EMPTY]: {
      description: msg('Heading must not be empty'),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
    },
    [blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
      description: msg('Heading should not contain bold or italic text'),
      tip: () => msg('Remove the bold or italic formatting from the text in the heading.'),
    },
    [blockValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
      customCorrectLabel: msg('Edit'),
      description: msg('Image must have alternative text'),
      tip: () => msg('Edit the image to supply an alt text'),
    },
    [blockValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
      description: msg('Avoid empty elements'),
      tip: (params) => {
        const { nodeType } = params || {};
        if (!nodeType || typeof nodeType !== 'string') {
          return null;
        }
        return msg(html`Remove the empty <strong>${nodeTypesTranslations()[nodeType]}</strong> or add text.`);
      },
    },
    [blockValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: {
      description: msg('Avoid making an entire paragraph bold'),
      docs: contentDocs['paragraph-strong'],
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/',
      tip: () => msg('Remove the bold formatting from the paragraph.'),
    },
    [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: {
      description: msg('Avoid paragraphs that resemble headings'),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
    },
    [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: {
      description: msg('List must be a semantic list'),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
      tip: (params) => {
        const { prefix } = params || {};
        if (!prefix) {
          return null;
        }
        return msg(html`Use a semantic list instead of lines starting with "<strong>${prefix}</strong>"`);
      },
    },
    [blockValidations.TABLE_MUST_HAVE_HEADINGS]: {
      description: msg('Table must contain headings'),
    },
    [blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: {
      description: msg('Table must contain multiple rows'),
    },
    [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
      description: msg(str`Document must have correct heading order`),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
      tip: (params) => {
        const { headingLevel, precedingHeadingLevel, topHeadingLevel } = params || {};

        if (headingLevel < topHeadingLevel) {
          return msg(
            html`<strong>Heading level ${headingLevel}</strong> exceeds the highest allowed heading level
              (${precedingHeadingLevel}) in this document.`,
          );
        }

        if (typeof precedingHeadingLevel !== 'number' || typeof topHeadingLevel !== 'number' || !headingLevel) {
          return null;
        }

        const min = topHeadingLevel === 1 ? 2 : topHeadingLevel;
        const max = precedingHeadingLevel + 1;
        const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);

        let levelsTemplate: TemplateResult;
        if (levels.length === 1) {
          levelsTemplate = html`<strong>${levels[0]}</strong>`;
        } else if (levels.length === 2) {
          levelsTemplate = html`<strong>${levels[0]}</strong> ${msg('or')} <strong>${levels[1]}</strong>`;
        } else {
          const head = levels.slice(0, -1);
          const last = levels[levels.length - 1];
          levelsTemplate = html`${head.map(
              (l, i) => html`<strong>${l}</strong>${i < head.length - 1 ? ', ' : ' '}`,
            )}${msg('or')} <strong>${last}</strong>`;
        }

        return msg(
          html`<strong>Heading level ${headingLevel}</strong> must not directly follow a
            <strong>heading level ${precedingHeadingLevel}</strong>. Use heading level ${levelsTemplate}.`,
        );
      },
    },
    [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
      description: msg('Document must have only one heading level 1'),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    },
    [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
      description: msg('Document must start with heading level 1'),
    },
    [inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY]: {
      description: msg('Element must not be empty'),
      tip: (params) => {
        const { nodeType } = params || {};
        if (!nodeType || typeof nodeType !== 'string') {
          return null;
        }
        return msg(html`Remove the empty <strong>${nodeTypesTranslations()[nodeType]}</strong>.`);
      },
    },
    [inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: {
      description: msg(str`Text should not be underlined. This looks too much like a link.`),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
      tip: () => msg(`Remove the underline from the text.`),
    },
    [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
      description: msg('Link text should not be too generic'),
      href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
    },
  }) as const;
