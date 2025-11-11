import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';
import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';

const outdir = 'cem';

export default {
  dependencies: false,
  dev: true,
  exclude: [],
  globs: ['src/components/**/*.ts'],
  litelement: true,
  outdir,
  packagejson: true,
  plugins: [customElementJetBrainsPlugin({ outdir }), customElementVsCodePlugin({ outdir })],
  watch: true,
};
