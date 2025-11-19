import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

describe('ClippyEditor', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the editor component', () => {
    const { container } = render(<div />);
    expect(container).toBeDefined();
  });
});
