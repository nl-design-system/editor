import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkCustomHeaderId from 'remark-custom-header-id';
const siteUrl = 'https://editor.nl-design-system-community.nl/';

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: 'never',
  },

  devToolbar: {
    enabled: false,
  },

  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    mdx({
      remarkPlugins: [remarkCustomHeaderId],
    }),
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.5,
    }),
  ],

  publicDir: '../../static',

  redirects: {
    '/alt-tekst-wizard': '/bibliotheken/alt-tekst-wizard',
    '/ckeditor': '/bibliotheken/ckeditor',
    '/configuratie': '/bibliotheken/editor/configuratie',
    '/en/alt-text-wizard': '/en/libraries/alt-text-wizard',
    '/en/configuration': '/en/libraries/editor/configuration',
    '/en/integrations': '/en/libraries',
    '/en/react': '/en/libraries/editor/react',
    '/integraties': '/bibliotheken',
    '/react': '/bibliotheken/editor/react',
  },

  server: {
    port: 5174,
  },

  site: siteUrl,

  vite: {
    build: {
      // prevent vite from inlining assets as data:* attributes because it violates csp rules
      assetsInlineLimit: 0,
    },
  },
});
