import { globalStyle, style } from '@vanilla-extract/css';

globalStyle(':root', {
  backgroundColor: '#242424',
  fontFamily: 'Fira Sans, Arial, sans-serif',
  fontSynthesis: 'none',
  fontWeight: 400,
  lineHeight: 1.5,
  margin: 0,
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
});

globalStyle('body', {
  margin: 0,
  padding: 0,
})

export const appStyling = style({
  margin: '0 auto',
  maxWidth: '800px',
})
