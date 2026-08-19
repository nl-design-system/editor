import '@fontsource/fira-sans/400.css';
import '@fontsource/fira-sans/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import '@nl-design-system-community/ma-design-tokens/dist/theme.css';
import '@nl-design-system-community/ma-design-tokens/dist/color-scheme-dark/theme.css';
import '@utrecht/design-tokens/dist/theme.css';
import './index';
import '../theme.css';
import { applyColorScheme } from './utils/colorScheme';

// Toggle the dark design tokens based on the user's preferred color scheme.
applyColorScheme();
