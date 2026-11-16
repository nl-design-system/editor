import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import './index';
import type { Editor } from './index';

const createEditor = ({ readonly = false } = {}): Editor => {
  const editor = document.createElement('clippy-editor');
  editor.id = 'test-editor';
  editor.readonly = readonly;
  editor.innerHTML = '<div slot="value"><h1>Titel</h1><h2></h2></div>';
  return document.body.appendChild(editor);
};

const violationCount = (editor: Editor) =>
  editor.shadowRoot?.querySelector('clippy-toolbar')?.trigger?.violationsMap?.size;

const editable = (editor: Editor) => editor.shadowRoot?.querySelector<HTMLElement>('[contenteditable]');

beforeEach(() => {
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('<clippy-editor>', () => {
  it('validates its content', async () => {
    const editor = createEditor();

    await expect.poll(() => violationCount(editor)).toBeGreaterThan(0);
  });

  it('re-validates when its validations change', async () => {
    const editor = createEditor();
    await expect.poll(() => violationCount(editor)).toBeGreaterThan(0);

    editor.validations = [];

    await expect.poll(() => violationCount(editor)).toBe(0);
  });

  it('stops being editable when it becomes read-only', async () => {
    const editor = createEditor();
    await expect.poll(() => editable(editor)).toHaveAttribute('contenteditable', 'true');

    editor.readonly = true;

    await expect.poll(() => editable(editor)).toHaveAttribute('contenteditable', 'false');
  });
});
