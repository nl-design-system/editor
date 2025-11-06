import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';

export default {
  dependencies: false,
  dev: true,
  exclude: [],
  globs: ['src/components/**/*.ts'],
  litelement: true,
  packagejson: true,
  plugins: [customElementJetBrainsPlugin()],
  watch: true,
};
