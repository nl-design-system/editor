import type { Locale } from '../i18n/translations.ts';
import { useTranslations } from '../i18n/translations.ts';

export interface NavigationItem {
  current: boolean;
  href: string;
  items?: NavigationItem[];
  label: string;
}

interface NavigationLink {
  href: string;
  items?: NavigationLink[];
  label: string;
}

export const getNavigationItems = (locale: Locale, pathname: string): NavigationItem[] => {
  const t = useTranslations(locale);

  const navItems: NavigationLink[] = [
    { href: t('nav.href.editor'), label: t('nav.editor') },
    { href: t('nav.href.configuration'), label: t('nav.configuration') },
    { href: t('nav.href.guidelines'), label: t('nav.guidelines') },
    { href: t('nav.href.react'), label: t('nav.react') },
    {
      href: t('nav.href.integrations'),
      items: [
        { href: '/ckeditor', label: 'CKEditor' },
        { href: `${t('nav.href.integrations')}#drupal`, label: 'Drupal' },
        { href: `${t('nav.href.integrations')}#typo3`, label: 'TYPO3' },
      ],
      label: t('nav.integrations'),
    },
    { href: t('nav.href.alt-text-wizard'), label: t('nav.alt-text-wizard') },
  ];

  const currentPath = pathname.replace(/\/$/, '') || '/';

  // Determine the root path for "active" check per locale
  const localeRoot = locale === 'en' ? '/en' : '/';

  const toItem = ({ href, items, label }: NavigationLink): NavigationItem => ({
    current: href === localeRoot ? currentPath === localeRoot : currentPath.startsWith(href),
    href,
    label,
    ...(items && { items: items.map(toItem) }),
  });

  return navItems.map(toItem);
};
