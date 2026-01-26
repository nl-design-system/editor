import { beforeEach } from 'vitest';
import '@fontsource/fira-sans/400.css';
import '@fontsource/fira-sans/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import '@nl-design-system-community/ma-design-tokens/dist/theme.css';
import './theme.css';

beforeEach(() => {
  // Add theme classes to the document root
  document.documentElement.classList.add('ma-theme', 'clippy-theme', 'utrecht-root');
});
