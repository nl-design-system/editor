import { createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  spacing: {
    lg: '2rem',
    md: '1rem',
    sm: '0.5rem',
  },
});
