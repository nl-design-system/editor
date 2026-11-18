import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { CustomEvents } from '@/events';
import '@/components/sidebar';
import '@/components/validations/view';
import './index';

describe('<clippy-content-views>', () => {
  const IDENTIFIER = 'tabs-editor';

  let content: HTMLElement;

  const region = () => page.getByRole('region', { name: 'Documentoverzicht' });

  const openOverview = (mode: string) =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode } }),
    );

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    content = document.createElement('main');
    content.innerHTML = '<h1>Titel</h1><p><a href="/contact">Contact</a></p><p lang="en">Hello</p>';
    const contentViews = document.createElement('clippy-content-views');
    contentViews.identifier = IDENTIFIER;
    contentViews.htmlDocument = content;
    const validationsView = document.createElement('clippy-validations-view');
    const sidebar = document.createElement('clippy-sidebar');
    for (const element of [sidebar, validationsView, contentViews]) element.identifier = IDENTIFIER;
    sidebar.append(validationsView, contentViews);
    document.body.replaceChildren(content, sidebar);
    await contentViews.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('shows a tab per content view with the opened view selected', async () => {
    openOverview('link-list');

    await vi.waitFor(() => expect(page.getByRole('tab').elements()).toHaveLength(3));
    await expect.element(page.getByRole('tab', { name: 'Kopstructuur' })).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tab', { name: 'Links' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tab', { name: 'Taalwijzigingen' })).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tabpanel', { name: 'Links' })).toBeVisible();
  });

  it('does not open for the validations', async () => {
    openOverview('validations');
    await document.querySelector('clippy-content-views')!.updateComplete;

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('closes when the validations of its hub open', async () => {
    openOverview('link-list');
    await expect.element(region()).toBeVisible();

    openOverview('validations');

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('closes when a validation group of its hub opens', async () => {
    openOverview('link-list');
    await expect.element(region()).toBeVisible();

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATION_GROUP, { detail: { identifier: IDENTIFIER, ranges: [] } }),
    );

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('closes with its close button', async () => {
    openOverview('link-list');

    await userEvent.click(page.getByRole('button', { name: 'Sluiten' }));

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('stays open when an element is focused', async () => {
    const contentViews = document.querySelector('clippy-content-views')!;
    openOverview('link-list');
    await expect.element(region()).toBeVisible();

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_NODE, { detail: { identifier: IDENTIFIER, range: document.createRange() } }),
    );
    await contentViews.updateComplete;

    await expect.element(region()).toBeVisible();
  });

  it('shows the Content views of the pushed document', async () => {
    openOverview('link-list');

    await expect.element(page.getByRole('link', { name: 'Contact' }).last()).toBeVisible();
  });

  it('switches the content view when a tab is clicked', async () => {
    openOverview('heading-structure');

    await userEvent.click(page.getByRole('tab', { name: 'Taalwijzigingen' }));

    await expect.element(page.getByRole('tab', { name: 'Taalwijzigingen' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tabpanel', { name: 'Taalwijzigingen' })).toBeVisible();
    await expect.element(page.getByRole('tabpanel', { name: 'Kopstructuur' })).not.toBeInTheDocument();
  });

  it('only keeps the selected tab in the tab sequence', async () => {
    openOverview('link-list');

    await expect.element(page.getByRole('tab', { name: 'Links' })).toHaveAttribute('tabindex', '0');
    await expect.element(page.getByRole('tab', { name: 'Kopstructuur' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves between tabs with the arrow, Home and End keys', async () => {
    openOverview('heading-structure');
    const tab = (name: string) => page.getByRole('tab', { name });
    const contentViews = document.querySelector('clippy-content-views')!;
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
