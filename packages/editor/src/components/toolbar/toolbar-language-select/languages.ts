export interface Language {
  dir: 'ltr' | 'rtl' | null;
  i18n: { [index: string]: string };
  lang: string;
}

export const languages: Language[] = [
  { dir: 'ltr', i18n: { bg: 'Български', en: 'Bulgarian' }, lang: 'bg' },
  { dir: 'ltr', i18n: { en: 'Croatian', hr: 'Hrvatski' }, lang: 'hr' },
  { dir: 'ltr', i18n: { cs: 'Čeština', en: 'Czech' }, lang: 'cs' },
  { dir: 'ltr', i18n: { da: 'Dansk', en: 'Danish' }, lang: 'da' },
  { dir: 'ltr', i18n: { en: 'Dutch', nl: 'Nederlands' }, lang: 'nl' },
  { dir: 'ltr', i18n: { en: 'English' }, lang: 'en' },
  { dir: 'ltr', i18n: { en: 'Estonian', et: 'Eesti' }, lang: 'et' },
  { dir: 'ltr', i18n: { en: 'Finish', fi: 'Suomi' }, lang: 'fi' },
  { dir: 'ltr', i18n: { en: 'French', fr: 'Français' }, lang: 'fr' },
  { dir: 'ltr', i18n: { de: 'Deutsch', en: 'German' }, lang: 'de' },
  { dir: 'ltr', i18n: { el: 'Ελληνική', en: 'Greek' }, lang: 'el' },
  { dir: 'ltr', i18n: { en: 'Hungarian', hu: 'Magyar' }, lang: 'hu' },
  { dir: 'ltr', i18n: { en: 'Irish', ga: 'Ghaeilge' }, lang: 'ga' },
  { dir: 'ltr', i18n: { en: 'Italian', it: 'Italiano' }, lang: 'it' },
  { dir: 'ltr', i18n: { en: 'Latvian', lv: 'Latviešu' }, lang: 'lv' },
  { dir: 'ltr', i18n: { en: 'Lithuanian', lt: 'Lietuvių' }, lang: 'lt' },
  { dir: 'ltr', i18n: { en: 'Maltese', mt: 'Malti' }, lang: 'mt' },
  { dir: 'ltr', i18n: { en: 'Polish', pl: 'Polski' }, lang: 'pl' },
  { dir: 'ltr', i18n: { en: 'Portuguese', pt: 'Português' }, lang: 'pt' },
  { dir: 'ltr', i18n: { en: 'Romanian', ro: 'Română' }, lang: 'ro' },
  { dir: 'ltr', i18n: { en: 'Slovak', sk: 'Slovenčina' }, lang: 'sk' },
  { dir: 'ltr', i18n: { en: 'Slovene', sl: 'Slovenščina' }, lang: 'sl' },
  { dir: 'ltr', i18n: { en: 'Spanish', es: 'Español' }, lang: 'es' },
  { dir: 'ltr', i18n: { en: 'Swedish', sv: 'Svenska' }, lang: 'sv' },
  { dir: 'rtl', i18n: { ar: 'اللغة العربية', en: 'Arabic' }, lang: 'ar' },
  { dir: 'rtl', i18n: { en: 'Hebrew', he: 'עברית' }, lang: 'he' },
];

// Normalize language code before comparing. To make "EN" match "en"
export const isSameLanguage = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const findLanguage = (lang: string, options: Language[] = languages) =>
  options.find((item) => isSameLanguage(lang, item.lang));

export const isDefaultDir = (lang: string, dir: string) => dir === findLanguage(lang)?.dir;
