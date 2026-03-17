export type Locale = 'nl' | 'en';

const translations = {
  en: {
    'configuration.editor.content': 'Content here...',
    'configuration.editor.placeholder': 'Modify the JSON to change the toolbar live.',
    'configuration.json.error.prefix': 'Invalid JSON: ',

    'configuration.json.label': 'Toolbar configuration (JSON)',
    // Configuration page
    'configuration.title': 'Toolbar configuration - Rich-text Editor - NL Design System',
    'footer.about': 'Clippy Editor was developed by the Expert Team Digital Accessibility commissioned by',
    'footer.accessibility': 'Accessibility',
    'footer.accessibility.href': 'https://nldesignsystem.nl/toegankelijkheidsverklaring/',
    'footer.contact': 'Contact',
    'footer.contact.href': 'https://nldesignsystem.nl/project/kernteam/',

    // Footer
    'footer.nav.label': 'Footer navigation',
    'footer.privacy': 'Privacy statement',
    'footer.privacy.href': 'https://nldesignsystem.nl/privacyverklaring/',
    // Guidelines page
    'guidelines.title': 'Accessibility guidelines - Rich-text Editor - NL Design System',
    'index.cta.github': 'Clippy Editor on GitHub',

    'index.cta.roadmap': 'Clippy Editor Roadmap',
    // Index page
    'index.title': 'Rich-text Editor - NL Design System',
    'nav.configuration': 'Configuration',
    'nav.editor': 'Editor',
    'nav.guidelines': 'Guidelines',
    'nav.href.configuration': '/en/configuration',
    // Nav hrefs
    'nav.href.editor': '/en',
    'nav.href.guidelines': '/en/guidelines',

    'nav.href.language': '/',
    'nav.href.react': '/en/react',
    // Navigation
    'nav.label': 'Main navigation',

    'nav.language': 'Nederlands',
    'nav.language.label': 'Schakel naar Nederlands',
    'nav.react': 'React',
    // React page
    'react.title': 'React integration - Rich-text Editor - NL Design System',
    'site.logo.label': 'NL Design System Editor – home',

    'site.logo.name': 'Clippy Editor',

    // Site
    'site.title': 'Rich-text Editor - NL Design System',
  },
  nl: {
    'configuration.editor.content': 'Inhoud hier...',
    'configuration.editor.placeholder': 'Pas de JSON aan om de toolbar live te wijzigen.',
    'configuration.json.error.prefix': 'Ongeldige JSON: ',

    'configuration.json.label': 'Toolbar configuratie (JSON)',
    // Configuration page
    'configuration.title': 'Toolbar configuratie - Rich-text Editor - NL Design System',
    'footer.about': 'De Clippy Editor is ontwikkeld door het Expertteam Digitale Toegankelijkheid in opdracht van',
    'footer.accessibility': 'Toegankelijkheid',
    'footer.accessibility.href': 'https://nldesignsystem.nl/toegankelijkheidsverklaring/',
    'footer.contact': 'Contact',
    'footer.contact.href': 'https://nldesignsystem.nl/project/kernteam/',

    // Footer
    'footer.nav.label': 'Voettekst navigatie',
    'footer.privacy': 'Privacyverklaring',
    'footer.privacy.href': 'https://nldesignsystem.nl/privacyverklaring/',
    // Guidelines page
    'guidelines.title': 'Toegankelijkheidsrichtlijnen - Rich-text Editor - NL Design System',
    'index.cta.github': 'Clippy Editor op GitHub',

    'index.cta.roadmap': 'Clippy Editor Roadmap',
    // Index page
    'index.title': 'Rich-text Editor - NL Design System',
    'nav.configuration': 'Configuratie',
    'nav.editor': 'Editor',
    'nav.guidelines': 'Richtlijnen',
    'nav.href.configuration': '/configuratie',
    // Nav hrefs
    'nav.href.editor': '/',
    'nav.href.guidelines': '/richtlijnen',

    'nav.href.language': '/en',
    'nav.href.react': '/react',
    // Navigation
    'nav.label': 'Hoofdnavigatie',

    'nav.language': 'English',
    'nav.language.label': 'Switch to English',
    'nav.react': 'React',
    // React page
    'react.title': 'React integratie - Rich-text Editor - NL Design System',
    'site.logo.label': 'NL Design System Editor – home',

    'site.logo.name': 'Clippy Editor',

    // Site
    'site.title': 'Rich-text Editor - NL Design System',
  },
} as const;

type TranslationKey = keyof (typeof translations)['nl'];

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return translations[locale][key];
  };
}
