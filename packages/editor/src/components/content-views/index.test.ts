import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import './index';
import type { ContentViews } from './index';

describe('<clippy-content-views>', () => {
  let contentViews: ContentViews;

  const tab = (name: string) => page.getByRole('tab', { name });

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    const content = document.createElement('main');
    content.innerHTML = '<h1>Titel</h1><p><a href="/contact">Contact</a></p><p lang="en">Hello</p>';
    contentViews = document.createElement('clippy-content-views');
    contentViews.htmlDocument = content;
    document.body.replaceChildren(content, contentViews);
    await contentViews.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is named "Documentoverzicht"', () => {
    expect(contentViews.label).toBe('Documentoverzicht');
  });

  it('shows a tab per Content view with the one it is set to selected', async () => {
    contentViews.view = 'link-list';

    await vi.waitFor(() => expect(page.getByRole('tab').elements()).toHaveLength(3));
    await expect.element(tab('Kopstructuur')).toHaveAttribute('aria-selected', 'false');
    await expect.element(tab('Links')).toHaveAttribute('aria-selected', 'true');
    await expect.element(tab('Taalwijzigingen')).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tabpanel', { name: 'Links' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Contact' }).last()).toBeVisible();
  });

  it('is hidden while hidden is set', async () => {
    contentViews.hidden = true;

    expect(contentViews).not.toBeVisible();
  });

  it('switches the Content view when a tab is clicked', async () => {
    await userEvent.click(tab('Taalwijzigingen'));

    await expect.element(tab('Taalwijzigingen')).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tabpanel', { name: 'Taalwijzigingen' })).toBeVisible();
    await expect.element(page.getByRole('tabpanel', { name: 'Kopstructuur' })).not.toBeInTheDocument();
    expect(contentViews.view).toBe('language-changes');
  });

  it('only keeps the selected tab in the tab sequence', async () => {
    contentViews.view = 'link-list';

    await expect.element(tab('Links')).toHaveAttribute('tabindex', '0');
    await expect.element(tab('Kopstructuur')).toHaveAttribute('tabindex', '-1');
  });

  it('moves between tabs with the arrow, Home and End keys', async () => {
    const expectFocus = (name: string) =>
      vi.waitFor(() => expect(contentViews.shadowRoot?.activeElement).toBe(tab(name).element()));
    await expect.element(tab('Kopstructuur')).toBeVisible();
    (tab('Kopstructuur').element() as HTMLElement).focus();

    await userEvent.keyboard('{ArrowRight}');
    await expectFocus('Links');
    await expect.element(tab('Links')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{End}');
    await expectFocus('Taalwijzigingen');

    await userEvent.keyboard('{ArrowRight}');
    await expectFocus('Kopstructuur');

    await userEvent.keyboard('{ArrowLeft}');
    await expectFocus('Taalwijzigingen');

    await userEvent.keyboard('{Home}');
    await expectFocus('Kopstructuur');
    await expect.element(tab('Kopstructuur')).toHaveAttribute('aria-selected', 'true');
  });
});
