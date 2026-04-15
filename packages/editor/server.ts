/**
 * Development SSR server for packages/editor.
 *
 * Follows the Vite SSR middleware-mode pattern:
 * https://github.com/bluwy/create-vite-extra/blob/master/template-ssr-vanilla
 *
 * Usage: pnpm dev:ssr
 */
import { getRequestListener } from '@hono/node-server';
import { Hono } from 'hono';
import * as fs from 'node:fs';
import { createServer } from 'node:http';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 5174;

// Vite dev server in middleware mode — handles HMR, module transforms and
// serves static assets. The `appType: 'custom'` option tells Vite to skip its
// own HTML-serving logic so our catch-all handler below takes over.
const vite = await createViteServer({
  appType: 'custom',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: { middlewareMode: true },
});

const app = new Hono();

app.all('*', async (c) => {
  try {
    const { pathname, search } = new URL(c.req.url);
    const url = pathname + search;

    let template = fs.readFileSync(path.resolve(__dirname, 'index.ssr.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);

    const { render } = (await vite.ssrLoadModule('/src/entry-server.ts')) as {
      render: () => string;
    };

    const appHtml = render();
    const html = template.replace('<!--ssr-outlet-->', appHtml);

    return c.html(html, 200);
  } catch (error) {
    vite.ssrFixStacktrace(error as Error);
    console.error(error);
    return c.text((error as Error).message, 500);
  }
});

// Convert the Hono app to a plain Node.js request listener so it can be
// composed after Vite's Connect-compatible middleware.
const honoListener = getRequestListener(app.fetch.bind(app));

// Vite's Connect middleware runs first (static assets, HMR, …).
// Requests it does not handle are forwarded to the Hono SSR handler.
const server = createServer((req, res) => {
  vite.middlewares(req, res, () => {
    honoListener(req, res);
  });
});

server.listen(port, () => {
  console.log(`SSR server running at http://localhost:${port}`);
});
