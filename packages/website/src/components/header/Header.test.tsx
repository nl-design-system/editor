import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import Header from './Header';

test('<Header />', async () => {
  const { getByText } = render(<Header />);
  await expect.element(getByText('Rich-text editor met editoria11y (PoC)')).toBeInTheDocument();
});
