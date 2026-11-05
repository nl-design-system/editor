import './index';
import '@nl-design-system-community/clippy-components/clippy-button';
import type { ClippyButton } from '@nl-design-system-community/clippy-components/clippy-button';
import { afterEach, describe, expect, it } from 'vitest';
import type { ButtonGroup } from './index';

const RADIUS = '8px';

const renderGroup = async (dir: 'ltr' | 'rtl' = 'ltr'): Promise<ButtonGroup> => {
  document.body.innerHTML = `
    <clippy-button-group dir="${dir}" style="--nl-button-border-radius: ${RADIUS}">
      <clippy-button slot="primary" purpose="primary">Corrigeren</clippy-button>
      <clippy-button slot="secondary" purpose="primary" icon-only>Meer correcties</clippy-button>
    </clippy-button-group>
  `;
  const group = document.querySelector('clippy-button-group') as ButtonGroup;
  await group.updateComplete;
  await Promise.all([...group.querySelectorAll<ClippyButton>('clippy-button')].map((button) => button.updateComplete));
  return group;
};

/** The rendered `nl-button` inside a slotted `clippy-button`, which is what carries the corners. */
const innerButton = (group: ButtonGroup, slot: 'primary' | 'secondary'): HTMLButtonElement =>
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

describe('<clippy-button-group>', () => {
  it('renders the primary button before the secondary one', async () => {
    const group = await renderGroup();
    const slots = [...(group.shadowRoot?.querySelectorAll('slot') ?? [])].map((slot) => slot.name);

    expect(slots).toEqual(['primary', 'secondary']);
  });

  it('squares the corners of the primary button where it meets the secondary one', async () => {
    const group = await renderGroup();

    expect(corners(innerButton(group, 'primary'))).toEqual({
      endEnd: '0px',
      endStart: RADIUS,
      startEnd: '0px',
      startStart: RADIUS,
    });
  });

  it('squares the corners of the secondary button where it meets the primary one', async () => {
    const group = await renderGroup();

    expect(corners(innerButton(group, 'secondary'))).toEqual({
      endEnd: RADIUS,
      endStart: '0px',
      startEnd: RADIUS,
      startStart: '0px',
    });
  });

  it('squares the corners where the buttons meet in a right-to-left layout too', async () => {
    const group = await renderGroup('rtl');

    expect(corners(innerButton(group, 'primary'))).toMatchObject({ endEnd: '0px', startStart: RADIUS });
    expect(corners(innerButton(group, 'secondary'))).toMatchObject({ endEnd: RADIUS, startStart: '0px' });
  });

  it('places the buttons against each other', async () => {
    const group = await renderGroup();
    const primary = innerButton(group, 'primary').getBoundingClientRect();
    const secondary = innerButton(group, 'secondary').getBoundingClientRect();

    expect(secondary.left).toBe(primary.right);
  });
});
