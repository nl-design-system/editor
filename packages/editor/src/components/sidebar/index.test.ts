import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { CustomEvents } from '@/events';
import '@/components/content-views';
import '@/components/validations/view';
import './index';
import { showSidebarView, type Sidebar } from './index';

const createSidebar = async (children = '<h3 slot="header">Titel</h3><p>Inhoud</p>'): Promise<Sidebar> => {
  const sidebar = document.createElement('clippy-sidebar');
  sidebar.label = 'Zijbalk';
  sidebar.open = true;
  sidebar.innerHTML = children;
  document.body.replaceChildren(sidebar);
  await sidebar.updateComplete;
  return sidebar;
};

const part = (sidebar: Sidebar, name: string) =>
  sidebar.shadowRoot!.querySelector<HTMLElement>(`.clippy-sidebar__${name}`)!;

describe('<clippy-sidebar>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is a region named by its label that is hidden while closed', async () => {
    const sidebar = await createSidebar();

    await expect.element(page.getByRole('region', { name: 'Zijbalk' })).toBeVisible();

    sidebar.open = false;
    await sidebar.updateComplete;

    await expect.element(page.getByRole('region', { name: 'Zijbalk' })).not.toBeInTheDocument();
  });

  it('shows the header slot on one line with the close button', async () => {
    const sidebar = await createSidebar();
    const heading = sidebar.querySelector('h3')!;
    const close = page.getByRole('button', { name: 'Sluiten' });
    await expect.element(close).toBeVisible();

    expect(heading.assignedSlot?.name).toBe('header');
    const headingBox = heading.getBoundingClientRect();
    const closeBox = close.element().getBoundingClientRect();
    expect(closeBox.left).toBeGreaterThanOrEqual(headingBox.right);
    expect(closeBox.top).toBeLessThan(headingBox.bottom);
    expect(closeBox.bottom).toBeGreaterThan(headingBox.top);
  });

  it('puts unslotted content in the body, below the header', async () => {
    const sidebar = await createSidebar();
    const paragraph = sidebar.querySelector('p')!;

    expect(paragraph.assignedSlot?.name).toBe('');
    expect(paragraph.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      sidebar.querySelector('h3')!.getBoundingClientRect().bottom,
    );
  });

  it('docks at the end side of the screen', async () => {
    const sidebar = await createSidebar();
    const { right, top } = sidebar.getBoundingClientRect();

    expect(getComputedStyle(sidebar).position).toBe('fixed');
    expect(right).toBe(document.documentElement.clientWidth);
    expect(top).toBe(0);
  });

  it('hides the footer until something is slotted into it', async () => {
    const sidebar = await createSidebar();
    expect(part(sidebar, 'footer')).not.toBeVisible();

    sidebar.append(Object.assign(document.createElement('p'), { slot: 'footer', textContent: 'Voettekst' }));

    await expect.element(page.getByText('Voettekst')).toBeVisible();
    expect(part(sidebar, 'footer')).toBeVisible();
  });

  it('closes when the close button is clicked', async () => {
    const sidebar = await createSidebar();
    let closes = 0;
    sidebar.addEventListener('close', () => closes++);

    await userEvent.click(page.getByRole('button', { name: 'Sluiten' }));

    expect(closes).toBe(1);
    expect(sidebar.open).toBe(false);
  });

  it('closes when Escape is pressed inside it', async () => {
    const sidebar = await createSidebar('<button slot="header">Knop</button>');
    let closes = 0;
    sidebar.addEventListener('close', () => closes++);
    sidebar.querySelector('button')!.focus();

    await userEvent.keyboard('{Escape}');

    expect(closes).toBe(1);
    expect(sidebar.open).toBe(false);
  });
});

describe('<clippy-sidebar> with views', () => {
  const IDENTIFIER = 'sidebar-test';

  let sidebar: Sidebar;

  const views = () => ({
    contentViews: sidebar.querySelector('clippy-content-views')!,
    validationsView: sidebar.querySelector('clippy-validations-view')!,
  });

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    sidebar = document.createElement('clippy-sidebar');
    sidebar.identifier = IDENTIFIER;
    sidebar.append(document.createElement('clippy-validations-view'), document.createElement('clippy-content-views'));
    document.body.replaceChildren(sidebar);
    await sidebar.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('opens on the view it shows, hiding the others, and is named by it', async () => {
    const { contentViews, validationsView } = views();

    showSidebarView(validationsView);
    await expect.element(page.getByRole('region', { name: 'Fouten, waarschuwingen of tips' })).toBeVisible();
    expect(contentViews.open).toBe(false);

    showSidebarView(contentViews);
    await expect.element(page.getByRole('region', { name: 'Documentoverzicht' })).toBeVisible();
    expect(validationsView.open).toBe(false);
    expect(validationsView).not.toBeVisible();
  });

  it('shows the header of a view on one line with the close button', async () => {
    const { validationsView } = views();
    showSidebarView(validationsView);
    await validationsView.updateComplete;
    const heading = validationsView.shadowRoot!.querySelector('h3')!;
    const close = page.getByRole('button', { name: 'Sluiten' });
    await expect.element(close).toBeVisible();

    const headingBox = heading.getBoundingClientRect();
    const closeBox = close.element().getBoundingClientRect();
    expect(closeBox.left).toBeGreaterThanOrEqual(headingBox.right);
    expect(closeBox.top).toBeLessThan(headingBox.bottom);
    expect(closeBox.bottom).toBeGreaterThan(headingBox.top);
  });

  it('hides its views when it closes', async () => {
    const { validationsView } = views();
    showSidebarView(validationsView);
    await sidebar.updateComplete;

    globalThis.dispatchEvent(new CustomEvent(CustomEvents.CLOSE_SIDEBAR, { detail: { identifier: IDENTIFIER } }));

    expect(sidebar.open).toBe(false);
    expect(validationsView.open).toBe(false);
  });

  it('announces when it opens, shows another view and closes', async () => {
    const toggles: unknown[] = [];
    const record = (event: Event) => toggles.push((event as CustomEvent).detail);
    globalThis.addEventListener(CustomEvents.SIDEBAR_TOGGLE, record);
    const { contentViews, validationsView } = views();

    showSidebarView(validationsView);
    await vi.waitFor(() => expect(toggles).toHaveLength(1));
    showSidebarView(contentViews);
    await vi.waitFor(() => expect(toggles).toHaveLength(2));
    sidebar.hide();
    await vi.waitFor(() => expect(toggles).toHaveLength(3));
    globalThis.removeEventListener(CustomEvents.SIDEBAR_TOGGLE, record);

    expect(toggles).toEqual([
      { identifier: IDENTIFIER, open: true },
      { identifier: IDENTIFIER, open: true },
      { identifier: IDENTIFIER, open: false },
    ]);
  });
});
