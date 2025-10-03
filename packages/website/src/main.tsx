import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@rijkshuisstijl-community/font/src/index.mjs';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
