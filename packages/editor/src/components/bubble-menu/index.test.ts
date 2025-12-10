import './index.ts';
import type { Editor } from '@tiptap/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';

describe('<clippy-bubble-menu>', () => {
  let container: HTMLElement;
  let editor: Editor;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    editor = await createTestEditor('<img src="test.jpg" alt="Test image" />');
  });

  afterEach(() => {
    document.body.removeChild(container);
    editor.destroy();
  });

  it('renders alignment buttons', async () => {
    container.innerHTML = '<clippy-bubble-menu></clippy-bubble-menu>';
    const element = container.querySelector('clippy-bubble-menu');

    await element?.updateComplete;

    const el = element?.shadowRoot?.querySelector('clippy-toolbar-button');
    expect(el).toBeDefined();
  });
});
