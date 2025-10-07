import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import App from './App';

test('<Header />', async () => {
  const { getByRole } = render(<App />);
  await expect.element(getByRole('main')).toBeInTheDocument();
});
