import { style } from '@vanilla-extract/css';
import { vars } from '../../../theme.css.ts';

export const toolbarStyling = style({
  backgroundColor: '#fff',
  padding: vars.spacing.sm,
});

export const toolbarButtonStyling = style({
  backgroundColor: '#1a1a1a',
  border: '1px solid transparent',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '1em',
  fontWeight: 500,
  marginRight: vars.spacing.sm,
  padding: '0.6em 1.2em',
  selectors: {
    '&:focus, &:focus-visible': {
      outline: '4px auto -webkit-focus-ring-color',
    },
    '&:hover': {
      borderColor: '#646cff',
    },
  },
  transition: 'border-color 0.25s',
});
