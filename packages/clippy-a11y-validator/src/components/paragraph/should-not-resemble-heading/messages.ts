import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This short, entirely bold paragraph looks like a heading.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
    solution: 'Use a real heading, so assistive technology can follow the structure of the document.',
  },
  nl: {
    error: 'Deze korte, volledig dikgedrukte alinea lijkt op een kop.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
    solution: 'Gebruik een echte kop, zodat hulpsoftware de structuur van het document kan volgen.',
  },
};
