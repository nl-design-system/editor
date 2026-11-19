import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import './index';
import type { Drawer } from './index';

const createDrawer = (children = '<h3 slot="header">Titel</h3><p>Inhoud</p>'): Drawer => {
  const drawer = document.createElement('clippy-sidebar');
  drawer.label = 'Lade';
  drawer.innerHTML = children;
  return drawer;
};

const openDrawer = async (children?: string): Promise<Drawer> => {
  const drawer = createDrawer(children);
  drawer.open = true;
  document.body.replaceChildren(drawer);
  await drawer.updateComplete;
  return drawer;
};

const part = (drawer: Drawer, name: string) =>
  drawer.shadowRoot!.querySelector<HTMLElement>(`.clippy-drawer__${name}`)!;

describe('<clippy-sidebar>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute('style');
  });

  it('is a region named by its label that is hidden while closed', async () => {
    const drawer = await openDrawer();

    await expect.element(page.getByRole('region', { name: 'Lade' })).toBeVisible();

    drawer.open = false;
    await drawer.updateComplete;

    await expect.element(page.getByRole('region', { name: 'Lade' })).not.toBeInTheDocument();
  });

  it('shows the header slot on one line with the close button', async () => {
    const drawer = await openDrawer();
    const heading = drawer.querySelector('h3')!;
    const close = page.getByRole('button', { name: 'Sluiten' });
    await expect.element(close).toBeVisible();

    expect(heading.assignedSlot?.name).toBe('header');
    const headingBox = heading.getBoundingClientRect();
    const closeBox = close.element().getBoundingClientRect();
    expect(closeBox.left).toBeGreaterThanOrEqual(headingBox.right);
    expect(closeBox.top).toBeLessThan(headingBox.bottom);
    expect(closeBox.bottom).toBeGreaterThan(headingBox.top);
  });

  it('shows its label as a heading that focus() focuses, while nothing is slotted into the header', async () => {
    const drawer = await openDrawer('<p>Inhoud</p>');

    await expect.element(page.getByRole('heading', { name: 'Lade', level: 3 })).toBeVisible();

    drawer.focus();

    expect(drawer.shadowRoot!.activeElement).toBe(drawer.shadowRoot!.querySelector('h3'));
  });

  it('puts unslotted content in the body', async () => {
    const drawer = await openDrawer();

    expect(drawer.querySelector('p')!.assignedSlot?.closest('.clippy-drawer__body')).toBe(part(drawer, 'body'));
  });

  it('hides the footer until something is slotted into it', async () => {
    const drawer = await openDrawer();
    expect(part(drawer, 'footer')).not.toBeVisible();

    drawer.append(Object.assign(document.createElement('p'), { slot: 'footer', textContent: 'Voettekst' }));

    await expect.element(page.getByText('Voettekst')).toBeVisible();
    expect(part(drawer, 'footer')).toBeVisible();
  });

  it('docks at the end side of the screen', async () => {
    const drawer = await openDrawer();
    const { right, top } = drawer.getBoundingClientRect();

    expect(right).toBe(document.documentElement.clientWidth);
    expect(top).toBe(0);
  });

  it('narrows the page while it is open', async () => {
    const drawer = await openDrawer();
    const { width } = drawer.getBoundingClientRect();

    expect(document.documentElement.style.marginInlineEnd).toBe(`${width}px`);

    drawer.open = false;
    await drawer.updateComplete;

    expect(document.documentElement.style.marginInlineEnd).toBe('');
  });

  it('closes and fires close when the close button is clicked', async () => {
    const drawer = await openDrawer();
    let closes = 0;
    drawer.addEventListener('close', () => closes++);

    await userEvent.click(page.getByRole('button', { name: 'Sluiten' }));

    expect(closes).toBe(1);
    expect(drawer.open).toBe(false);
  });

  it('closes and fires close when Escape is pressed inside it', async () => {
    const drawer = await openDrawer('<button slot="header">Knop</button>');
    let closes = 0;
    drawer.addEventListener('close', () => closes++);
    drawer.querySelector('button')!.focus();

    await userEvent.keyboard('{Escape}');

    expect(closes).toBe(1);
    expect(drawer.open).toBe(false);
  });

  it('fires toggle once it shows that it opened or closed', async () => {
    const drawer = createDrawer();
    document.body.replaceChildren(drawer);
    const toggles: unknown[] = [];
    drawer.addEventListener('toggle', (event) => toggles.push(event.newState));

    drawer.open = true;
    await vi.waitFor(() => expect(toggles).toEqual(['open']));
    drawer.open = false;

    await vi.waitFor(() => expect(toggles).toEqual(['open', 'closed']));
  });

  it('closes another open drawer when it opens', async () => {
    const first = await openDrawer();
    const second = createDrawer();
    document.body.append(second);

    second.open = true;
    await second.updateComplete;

    expect(first.open).toBe(false);
  });
});
