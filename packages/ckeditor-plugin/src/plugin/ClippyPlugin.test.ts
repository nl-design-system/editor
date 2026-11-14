import type { Violation, ViolationsMap } from '@nl-design-system-community/editor/validators';
import { type Gutter, validationInteractionMode } from '@nl-design-system-community/editor/gutter';
import { Bold, ClassicEditor, Essentials, Heading, Paragraph, type Editor } from 'ckeditor5';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { ClippyPlugin } from './ClippyPlugin.ts';

let editor: Editor | undefined;

afterEach(async () => {
  await editor?.destroy();
  editor = undefined;
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

const createEditor = async (html: string): Promise<Editor> => {
  const element = document.createElement('div');
  document.body.append(element);

  editor = await ClassicEditor.create(element, {
    licenseKey: 'GPL',
    plugins: [Essentials, Paragraph, Heading, Bold, ClippyPlugin],
  });
  editor.setData(html);
  return editor;
};

describe('ClippyPlugin', () => {
  it('shows Clippy in Dutch, marked as such, in a CMS set to English', async () => {
    document.documentElement.lang = 'en';
    await createEditor('<h2>Kop</h2><p>Tekst</p>');

    await expect.element(page.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' })).toBeInTheDocument();
    for (const tag of [
      'clippy-accessibility-notifications',
      'clippy-validations-drawer',
      'clippy-validations-gutter',
    ]) {
      expect(document.querySelector(tag), tag).toHaveAttribute('lang', 'nl');
    }
  });

  it('wires the gutter to open the drawer, scoped to the same editor identifier', async () => {
    await createEditor('<h2>Kop</h2><p>Tekst</p>');

    const gutter = document.querySelector('clippy-validations-gutter') as Gutter | null;
    const drawer = document.querySelector('clippy-validations-drawer');

    expect(gutter).not.toBeNull();
    expect(drawer).not.toBeNull();
    expect(gutter?.mode).toBe(validationInteractionMode.DRAWER);
    expect(gutter?.identifier).toBeTruthy();
    expect(gutter?.identifier).toBe((drawer as { identifier?: string } | null)?.identifier);
  });

  /**
   * The plugin swaps the fix for a model-aware one. Rebuilding the correction instead of spreading
   * it would drop the label the editor resolved, silently resetting the button to "Correct".
   */
  it('keeps the correction label when it routes the fix through the model', async () => {
    const instance = await createEditor('<p></p>');
    const plugin = instance.plugins.get(ClippyPlugin) as unknown as {
      _patchCorrectionsForCKEditor: (map: ViolationsMap) => ViolationsMap;
    };
    const violation = {
      corrections: [{ execute: () => {}, label: 'Bewerken' }],
      display: 'block',
      element: document.createElement('p'),
      messages: { title: 'Deze alinea is leeg.' },
      rule: 'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
      scope: 'element',
      severity: 'error',
    } as Violation;
    const original = violation.corrections?.[0]?.execute;

    plugin._patchCorrectionsForCKEditor(new Map([[document.createRange(), violation]]));

    expect(violation.corrections?.[0]?.label).toBe('Bewerken');
    expect(violation.corrections?.[0]?.execute).not.toBe(original);
  });

  it('routes an alternative correction through the model as well', async () => {
    const text = 'Deze alinea is volledig dikgedrukt en veel te lang om nog als een kop te kunnen doorgaan.';
    const instance = await createEditor(`<h2>Kop</h2><p><strong>${text}</strong></p>`);
    const plugin = instance.plugins.get(ClippyPlugin) as unknown as { _violationsMap: ViolationsMap };
    const boldViolation = () =>
      [...plugin._violationsMap.values()].find(({ rule }) => rule === 'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD');
    await vi.waitFor(() => expect(boldViolation()?.corrections).toHaveLength(2));

    boldViolation()?.corrections?.[1]?.execute();

    expect(instance.getData()).toBe(`<h2>Kop</h2><h3>${text}</h3>`);
  });
});
