export type Locale = 'nl' | 'en';

const translations = {
  en: {
    'alt-text-wizard.title': 'Alt-text wizard - Rich-text Editor - NL Design System',
    'configuration.editor.content': 'Content here...',
    'configuration.editor.placeholder': 'Modify the JSON to change the toolbar live.',

    'configuration.json.error.prefix': 'Invalid JSON: ',
    'configuration.json.label': 'Toolbar configuration (JSON)',
    'configuration.title': 'Toolbar configuration - Rich-text Editor - NL Design System',
    'footer.about': 'Clippy Editor was developed by the Expert Team Digital Accessibility commissioned by',
    'footer.accessibility': 'Accessibility',
    'footer.accessibility.href': 'https://nldesignsystem.nl/toegankelijkheidsverklaring/',
    'footer.contact': 'Contact',

    'footer.contact.href': 'https://nldesignsystem.nl/project/kernteam/',
    'footer.nav.label': 'Footer navigation',
    'footer.privacy': 'Privacy statement',
    'footer.privacy.href': 'https://nldesignsystem.nl/privacyverklaring/',
    'guidelines.title': 'Accessibility guidelines - Rich-text Editor - NL Design System',
    'index.cta.github': 'Clippy Editor on GitHub',
    'index.cta.roadmap': 'Clippy Editor Roadmap',
    'index.title': 'Rich-text Editor - NL Design System',
    'integrations.title': 'Integrations - Rich-text Editor - NL Design System',
    'nav.alt-text-wizard': 'Alt-text wizard',
    'nav.configuration': 'Configuration',
    'nav.editor': 'Editor',
    'nav.guidelines': 'Guidelines',
    'nav.href.alt-text-wizard': '/en/alt-text-wizard',
    'nav.href.configuration': '/en/configuration',
    'nav.href.editor': '/en',
    'nav.href.guidelines': '/en/guidelines',
    'nav.href.integrations': '/en/integrations',
    'nav.href.language': '/',
    'nav.href.react': '/en/react',

    'nav.integrations': 'Integrations',
    'nav.label': 'Main navigation',
    'nav.language': 'Nederlands',
    'nav.language.label': 'Schakel naar Nederlands',
    'nav.react': 'React',
    'react.title': 'React integration - Rich-text Editor - NL Design System',
    'site.logo.label': 'NL Design System Editor – home',

    'site.title': 'Rich-text Editor - NL Design System',
  },
  nl: {
    'alt-text-wizard.title': 'Alt-tekst wizard - Rich-text Editor - NL Design System',
    'configuration.editor.content': 'Inhoud hier...',
    'configuration.editor.placeholder': 'Pas de JSON aan om de toolbar live te wijzigen.',

    'configuration.json.error.prefix': 'Ongeldige JSON: ',
    'configuration.json.label': 'Toolbar configuratie (JSON)',
    'configuration.title': 'Toolbar configuratie - Rich-text Editor - NL Design System',
    'footer.about': 'De Clippy Editor is ontwikkeld door het Expertteam Digitale Toegankelijkheid in opdracht van',
    'footer.accessibility': 'Toegankelijkheid',
    'footer.accessibility.href': 'https://nldesignsystem.nl/toegankelijkheidsverklaring/',
    'footer.contact': 'Contact',

    'footer.contact.href': 'https://nldesignsystem.nl/project/kernteam/',
    'footer.nav.label': 'Voettekst navigatie',
    'footer.privacy': 'Privacyverklaring',
    'footer.privacy.href': 'https://nldesignsystem.nl/privacyverklaring/',
    'guidelines.title': 'Toegankelijkheidsrichtlijnen - Rich-text Editor - NL Design System',
    'index.cta.github': 'Clippy Editor op GitHub',

    'index.cta.roadmap': 'Clippy Editor Roadmap',
    'index.title': 'Rich-text Editor - NL Design System',
    'integrations.title': 'Integraties - Rich-text Editor - NL Design System',

    'nav.alt-text-wizard': 'Alt-tekst wizard',
    'nav.configuration': 'Configuratie',
    'nav.editor': 'Editor',
    'nav.guidelines': 'Richtlijnen',
    'nav.href.alt-text-wizard': '/alt-tekst-wizard',
    'nav.href.configuration': '/configuratie',
    'nav.href.editor': '/',
    'nav.href.guidelines': '/richtlijnen',

    'nav.href.integrations': '/integraties',
    'nav.href.language': '/en',
    'nav.href.react': '/react',

    'nav.integrations': 'Integraties',
    'nav.label': 'Hoofdnavigatie',
    'nav.language': 'English',
    'nav.language.label': 'Switch to English',
    'nav.react': 'React',
    'react.title': 'React integratie - Rich-text Editor - NL Design System',
    'site.logo.label': 'NL Design System Editor – home',
    'site.title': 'Rich-text Editor - NL Design System',
  },
} as const;

type TranslationKey = keyof (typeof translations)['nl'];

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return translations[locale][key];
  };
}
