import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This table has no header row and no header column.',
    solution: 'Turn the first row or the first column into a header, so assistive technology can name the cells.',
  },
  nl: {
    error: 'Deze tabel heeft geen koprij en geen kopkolom.',
    solution: 'Maak van de eerste rij of de eerste kolom een kop, zodat hulpsoftware de cellen kan benoemen.',
  },
};
