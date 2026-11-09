import './index';
import '@nl-design-system-community/clippy-components/clippy-button';
import type { ClippyButton } from '@nl-design-system-community/clippy-components/clippy-button';
import { afterEach, describe, expect, it } from 'vitest';
import type { SplitButton } from './index';

const RADIUS = '8px';

const renderSplitButton = async (dir: 'ltr' | 'rtl' = 'ltr', purpose = 'primary'): Promise<SplitButton> => {
  document.body.innerHTML = `
    <clippy-split-button
      dir="${dir}"
      style="--nl-button-border-radius: ${RADIUS}; --basis-color-action-1-border-subtle: #dbb8e6"
    >
      <clippy-button slot="primary" purpose="${purpose}">Corrigeren</clippy-button>
      <clippy-button slot="secondary" purpose="primary" icon-only>Meer correcties</clippy-button>
      <ul slot="menu" role="menu"><li role="none"><button role="menuitem">Omzetten naar citaat</button></li></ul>
    </clippy-split-button>
  `;
  const group = document.querySelector('clippy-split-button') as SplitButton;
  await group.updateComplete;
  await Promise.all([...group.querySelectorAll<ClippyButton>('clippy-button')].map((button) => button.updateComplete));
  return group;
};

/** The rendered `nl-button` inside a slotted `clippy-button`, which is what carries the corners. */
const innerButton = (group: SplitButton, slot: 'primary' | 'secondary'): HTMLButtonElement =>
  group.querySelector(`[slot="${slot}"]`)!.shadowRoot!.querySelector('button')!;

const corners = (button: HTMLElement) => {
  const style = getComputedStyle(button);
  return {
    endEnd: style.borderEndEndRadius,
    endStart: style.borderEndStartRadius,
    startEnd: style.borderStartEndRadius,
    startStart: style.borderStartStartRadius,
  };
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<clippy-split-button>', () => {
  it('renders the primary button before the secondary one', async () => {
    const group = await renderSplitButton();
    const slots = [...(group.shadowRoot?.querySelectorAll('slot') ?? [])].map((slot) => slot.name);

    expect(slots).toEqual(['primary', 'secondary', 'menu']);
  });

  it('squares the corners of the primary button where it meets the secondary one', async () => {
    const group = await renderSplitButton();

    expect(corners(innerButton(group, 'primary'))).toEqual({
      endEnd: '0px',
      endStart: RADIUS,
      startEnd: '0px',
      startStart: RADIUS,
    });
  });

  it('squares the corners of the secondary button where it meets the primary one', async () => {
    const group = await renderSplitButton();

    expect(corners(innerButton(group, 'secondary'))).toEqual({
      endEnd: RADIUS,
      endStart: '0px',
      startEnd: RADIUS,
      startStart: '0px',
    });
  });

  it('squares the corners where the buttons meet in a right-to-left layout too', async () => {
    const group = await renderSplitButton('rtl');

    expect(corners(innerButton(group, 'primary'))).toMatchObject({ endEnd: '0px', startStart: RADIUS });
    expect(corners(innerButton(group, 'secondary'))).toMatchObject({ endEnd: RADIUS, startStart: '0px' });
  });

  it('places the buttons against each other', async () => {
    const group = await renderSplitButton();
    const primary = group.querySelector('[slot="primary"]')!.getBoundingClientRect();
    const secondary = group.querySelector('[slot="secondary"]')!.getBoundingClientRect();

    expect(secondary.left).toBe(primary.right);
  });

  it('divides a primary-purpose primary button from the secondary one with a lighter accent line', async () => {
    const group = await renderSplitButton();
    const primary = group.querySelector('[slot="primary"]')!;
    const style = getComputedStyle(primary);

    expect(style.borderInlineEndWidth).toBe('1px');
    expect(style.borderInlineEndStyle).toBe('solid');
    expect(style.borderInlineEndColor).toBe('rgb(219, 184, 230)');
    expect(primary.getBoundingClientRect().height).toBe(innerButton(group, 'primary').getBoundingClientRect().height);
  });

  it('puts the dividing line where the buttons meet in a right-to-left layout too', async () => {
    const group = await renderSplitButton('rtl');
    const style = getComputedStyle(group.querySelector('[slot="primary"]')!);

    expect(style.borderLeftWidth).toBe('1px');
    expect(style.borderRightWidth).toBe('0px');
  });

  it('adds no dividing line to a primary button of another purpose', async () => {
    const group = await renderSplitButton('ltr', 'secondary');

    expect(getComputedStyle(group.querySelector('[slot="primary"]')!).borderInlineEndWidth).toBe('0px');
  });

  it('drops the menu below the buttons, at least as wide as the group', async () => {
    const group = await renderSplitButton();
    const menu = group.querySelector('[slot="menu"]')!.getBoundingClientRect();
    const buttons = group.getBoundingClientRect();

    expect(menu.top).toBe(buttons.bottom);
    expect(menu.left).toBe(buttons.left);
    expect(menu.width).toBeGreaterThanOrEqual(buttons.width);
  });

  it('strips the list styling and any spacing from the menu', async () => {
    const group = await renderSplitButton();
    group.style.setProperty('--basis-space-block-xs', '4px');
    const style = getComputedStyle(group.querySelector('[slot="menu"]')!);

    expect(style.listStyleType).toBe('none');
    expect(style.padding).toBe('0px');
    expect(style.margin).toBe('0px');
  });

  it('clips the menu items to the rounded corners of the menu', async () => {
    const group = await renderSplitButton();

    expect(getComputedStyle(group.querySelector('[slot="menu"]')!).overflow).toBe('hidden');
  });

  it('styles the menu from its own custom properties', async () => {
    const group = await renderSplitButton();
    group.style.setProperty('--clippy-split-button-menu-background-color', 'rgb(1, 2, 3)');
    group.style.setProperty('--clippy-split-button-menu-border-radius', '3px');

    const style = getComputedStyle(group.querySelector('[slot="menu"]')!);

    expect(style.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(style.borderStartStartRadius).toBe('3px');
  });

  it('hands the menu items a square border radius by default', async () => {
    const group = await renderSplitButton();
    const item = group.querySelector('[role="menuitem"]')!;

    expect(getComputedStyle(item).getPropertyValue('--clippy-split-button-menu-item-border-radius').trim()).toBe('0');
  });
});
