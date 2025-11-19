import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ClippyEditor } from './Editor';

describe('ClippyEditor', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the editor component', () => {
    const { container } = render(<ClippyEditor />);
    const editor = container.querySelector('clippy-editor');
    expect(editor).toBeDefined();
  });

  it('has hidden attribute on slotted content', () => {
    const { container } = render(
      <ClippyEditor>
        <div slot="content" hidden>
          <p>Content</p>
        </div>
      </ClippyEditor>,
    );

    const slottedContent = container.querySelector('[slot="content"]');
    expect(slottedContent?.hasAttribute('hidden')).toBeTruthy();
  });

  it('renders slotted content correctly', async () => {
    const { container } = render(
      <ClippyEditor>
        <div slot="content" hidden>
          <h1>Test Heading</h1>
          <p>Test paragraph content</p>
        </div>
      </ClippyEditor>,
    );
    await container.querySelector('clippy-editor')?.updateComplete;
    const contentElement = container
      .querySelector('clippy-editor')
      ?.shadowRoot?.querySelector('#editor .clippy-editor-content');
    expect(contentElement).toBeDefined();

    expect(contentElement?.querySelector('h1')?.innerHTML).toBe('Test Heading');
  });
});
