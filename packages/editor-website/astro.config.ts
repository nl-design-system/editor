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
    '/alt-tekst-wizard': '/hulpmiddelen/alt-tekst-wizard',
    '/ckeditor': '/hulpmiddelen/ckeditor',
    '/configuratie': '/hulpmiddelen/editor/configuratie',
    '/en/alt-text-wizard': '/en/tools/alt-text-wizard',
    '/en/configuration': '/en/tools/editor/configuration',
    '/en/guidelines': '/en/validations',
    '/en/integrations': '/en/tools',
    '/en/react': '/en/tools/editor/react',
    '/integraties': '/hulpmiddelen',
    '/react': '/hulpmiddelen/editor/react',
    '/richtlijnen': '/validaties',
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
