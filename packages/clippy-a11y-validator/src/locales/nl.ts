import {
  definitionListValidations,
  headingValidations,
  imageValidations,
  linkValidations,
  paragraphValidations,
  richTextContentValidations,
  tableValidations,
} from '@/constants';
import type { MessageTable } from './types';
import { paragraphStrongError, paragraphStrongSolution } from './documentation';
import { orList } from './format';

export const nl: MessageTable = {
  [definitionListValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    description: 'Definitiebeschrijving moet een definitieterm volgen',
  },
  [definitionListValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    description: 'Definitielijst moet een definitieterm bevatten',
  },
  [headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document moet correcte kopvolgorde hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: ({ aboveTopLevel, allowedLevels, headingLevel, precedingHeadingLevel }) =>
      aboveTopLevel
        ? `**Kopniveau ${headingLevel}** overschrijdt het hoogste toegestane kopniveau (${precedingHeadingLevel}) in dit document.`
        : `**Kopniveau ${headingLevel}** mag niet direct volgen op een **kopniveau ${precedingHeadingLevel}**. Gebruik kopniveau ${orList(allowedLevels as number[], 'nl')}.`,
  },
  [headingValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    description: 'Document mag maar één kopniveau 1 hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [headingValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    description: 'Document moet beginnen met kopniveau 1',
  },
  [headingValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Koptekst mag niet leeg zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [headingValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    description: 'Kop mag geen vetgedrukte of cursieve tekst bevatten',
    solution: 'Verwijder vetgedrukte of cursieve tekst uit de tekst in de kop.',
  },
  [imageValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    correctLabel: 'Bewerken',
    description: 'Afbeelding moet alternatieve tekst hebben',
    solution: 'Bewerk de afbeelding om een alt-tekst toe te voegen',
  },
  [linkValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    description: 'Linktekst mag niet te algemeen zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
  nodeTypes: {
    bold: 'vetgedrukt',
    code: 'code',
    definitionDescription: 'definitiebeschrijving',
    definitionTerm: 'definitieterm',
    highlight: 'markering',
    italic: 'cursief',
    link: 'linktekst',
    listItem: 'lijstitem',
    paragraph: 'paragraaf',
    strike: 'doorhalen',
    tableCaption: 'tabelbijschrift',
    tableCell: 'tabelcel',
    tableHeader: 'tabelkop',
    underline: 'onderstreept',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: {
    // NL Design System publishes Dutch prose for this rule; fall back to our own if it ever ships empty.
    description: paragraphStrongError || 'Vermijd het vetgedrukt maken van een hele alinea',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/',
    solution: paragraphStrongSolution || 'Verwijder de vetgedrukte opmaak uit de alinea.',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: {
    description: "Vermijd alinea's die op koppen lijken",
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: {
    description: 'Lijst moet een semantische lijst zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    solution: 'Gebruik een semantische lijst in plaats van regels die beginnen met "**{{prefix}}**"',
  },
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Element mag niet leeg zijn',
    solution: 'Verwijder de lege **{{nodeType}}**.',
  },
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: {
    description: 'Tekst mag niet onderstreept zijn. Dit lijkt teveel op een link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    solution: 'Verwijder de onderstreping van de tekst.',
  },
  [richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Vermijd lege elementen',
    solution: 'Verwijder de lege **{{nodeType}}** of voeg tekst toe.',
  },
  [tableValidations.TABLE_MUST_HAVE_HEADINGS]: {
    description: 'Tabel moet koppen bevatten',
  },
  [tableValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: {
    description: 'Tabel moet meerdere rijen bevatten',
  },
};
