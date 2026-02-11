export interface Language {
  dir: 'ltr' | 'rtl' | null;
  lang: string;
}

// Currently the lists only consists of the official European languages in 2025,
// plus Arabic and Hebrew as testing languages for right-to-left,
// and with labels in English.
// The list should be expanded to include the associated writing direction (dir: "rtl" or dir: "ltr"),
// the label of the language in the language itself, and to have all ISO-639-1 languages.

export const languages: Language[] = [
  { dir: 'ltr', lang: 'bg' },
  { dir: 'ltr', lang: 'hr' },
  { dir: 'ltr', lang: 'cs' },
  { dir: 'ltr', lang: 'da' },
  { dir: 'ltr', lang: 'nl' },
  { dir: 'ltr', lang: 'en' },
  { dir: 'ltr', lang: 'et' },
  { dir: 'ltr', lang: 'fi' },
  { dir: 'ltr', lang: 'fr' },
  { dir: 'ltr', lang: 'de' },
  { dir: 'ltr', lang: 'el' },
  { dir: 'ltr', lang: 'hu' },
  { dir: 'ltr', lang: 'ga' },
  { dir: 'ltr', lang: 'it' },
  { dir: 'ltr', lang: 'lv' },
  { dir: 'ltr', lang: 'lt' },
  { dir: 'ltr', lang: 'mt' },
  { dir: 'ltr', lang: 'pl' },
  { dir: 'ltr', lang: 'pt' },
  { dir: 'ltr', lang: 'ro' },
  { dir: 'ltr', lang: 'sk' },
  { dir: 'ltr', lang: 'sl' },
  { dir: 'ltr', lang: 'es' },
  { dir: 'ltr', lang: 'sv' },
  { dir: 'rtl', lang: 'ar' },
  { dir: 'rtl', lang: 'he' },
];

// Normalize language code before comparing. To make "EN" match "en"
export const isSameLanguage = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const findLanguage = (lang: string, options: Language[] = languages) =>
  options.find((item) => isSameLanguage(lang, item.lang));

export const isDefaultDir = (lang: string, dir: string) => dir === findLanguage(lang)?.dir;
