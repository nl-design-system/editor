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
    {
      href: t('nav.href.libraries'),
      items: [
        {
          href: t('nav.href.library.a11y-validator'),
          items: [
            { href: t('nav.href.browser'), label: t('nav.browser') },
            { href: t('nav.href.command-line'), label: t('nav.command-line') },
          ],
          label: t('nav.library.a11y-validator'),
        },
        {
          href: t('nav.href.libraries'),
          items: [
            { href: t('nav.href.library.ckeditor'), label: 'CKEditor' },
            { href: t('nav.href.library.drupal'), label: 'Drupal' },
            { href: t('nav.href.library.typo3'), label: 'TYPO3' },
          ],
          label: t('nav.integrations'),
        },
        {
          href: t('nav.href.library.editor'),
          items: [
            { href: t('nav.href.components'), label: t('nav.components') },
            { href: t('nav.href.configuration'), label: t('nav.configuration') },
            { href: t('nav.href.react'), label: t('nav.react') },
          ],
          label: t('nav.library.editor'),
        },
        { href: t('nav.href.alt-text-wizard'), label: t('nav.alt-text-wizard') },
      ],
      label: t('nav.libraries'),
    },
    { href: t('nav.href.guidelines'), label: t('nav.guidelines') },
    { href: t('nav.href.demo'), label: t('nav.demo') },
    { href: t('nav.href.community'), label: t('nav.community') },
  ];

  const currentPath = pathname.replace(/\/$/, '') || '/';

  // Determine the root path for "active" check per locale
  const localeRoot = locale === 'en' ? '/en' : '/';

  const toItem = ({ href, items, label }: NavigationLink): NavigationItem => {
    if (items) {
      const children = items.map(toItem);
      return { current: currentPath === href || children.some(({ current }) => current), href, items: children, label };
    }
    return {
      current: href === localeRoot ? currentPath === localeRoot : currentPath.startsWith(href),
      href,
      label,
    };
  };

  return navItems.map(toItem);
};
