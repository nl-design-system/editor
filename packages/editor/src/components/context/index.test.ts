import {
  coreValidations,
  defineValidation,
  type Validation,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from './index';
import '@/components/content';
import './index';

/** A rule the core set does not cover, so its presence proves the host's own set was used. */
const paragraphMustNotShout = defineValidation({
  condition: (paragraph) => {
    const text = paragraph.textContent ?? '';
    return text.trim() === '' || text !== text.toUpperCase();
  },
  messages: { nl: { error: 'Deze alinea staat volledig in hoofdletters.' } },
  rule: 'PARAGRAPH_MUST_NOT_SHOUT',
  scope: 'element',
  selector: 'p',
  severity: validationSeverity.WARNING,
});

const CONTENT = '<h1>Titel</h1><p>LET OP</p><p></p>';

/** Longer than the validation debounce, so a re-run triggered by an edit has landed. */
const VALIDATION_SETTLE_MS = 1500;

/** Assigns `validations` before the first update, the moment a host script gets after parsing. */
const render = async (attributes = '', validations?: readonly Validation[]): Promise<Context> => {
  document.body.innerHTML = `
    <clippy-context id="validations-property-test" ${attributes}>
      <div slot="value">${CONTENT}</div>
      <clippy-content></clippy-content>
    </clippy-context>`;

  const context = document.querySelector('clippy-context') as Context;
  if (validations) context.validations = validations;
  await context.updateComplete;
  return context;
};

const rulesOf = (context: Context): string[] => [...context.violationsContext.values()].map(({ rule }) => rule);

const settled = async (context: Context): Promise<void> => {
  await vi.waitFor(() => expect(context.violationsContext.size).toBeGreaterThan(0));
};

beforeEach(() => {
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<clippy-context> validations property', () => {
  it('runs every core validation when none are given', async () => {
    const context = await render();
    await settled(context);

    expect(rulesOf(context)).toContain('PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(rulesOf(context)).not.toContain('PARAGRAPH_MUST_NOT_SHOUT');
  });

  it('runs only the core validations it is given', async () => {
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });

  it('runs a validation the host wrote itself', async () => {
    const context = await render('', [paragraphMustNotShout]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });

  it('keeps the validations it started with when the content is edited', async () => {
    const context = await render('', [paragraphMustNotShout]);
    await settled(context);

    context.editor?.commands.insertContent('x');
    await new Promise((resolve) => {
      setTimeout(resolve, VALIDATION_SETTLE_MS);
    });

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });

  it('re-runs with the new set when the property is assigned after mounting', async () => {
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    await vi.waitFor(() => expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']));
  });

  /**
   * The editor reads the property afresh on every run, so an edit after a late assignment keeps
   * the new set rather than falling back to the one captured when the extensions were built.
   */
  it('keeps a newly assigned set when the content is edited afterwards', async () => {
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);
    context.validations = [paragraphMustNotShout];
    await context.updateComplete;
    await vi.waitFor(() => expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']));

    context.editor?.commands.insertContent('x');
    await new Promise((resolve) => {
      setTimeout(resolve, VALIDATION_SETTLE_MS);
    });

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });

  it('re-runs in readonly mode when the property is assigned after mounting', async () => {
    const context = await render('readonly', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    await vi.waitFor(() => expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']));
  });

  it('reports nothing when given an empty set', async () => {
    const context = await render('', []);
    await context.updateComplete;

    expect(context.violationsContext.size).toBe(0);
  });

  it('reads the property in readonly mode, where there is no editor', async () => {
    const context = await render('readonly', [paragraphMustNotShout]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });
});

type ConnectOptions = { name: string };
type DevtoolsGlobal = {
  __REDUX_DEVTOOLS_EXTENSION__?: { connect: (options: ConnectOptions) => unknown };
};

const fakeConnection = () => ({ init: vi.fn(), send: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() });

describe('<clippy-context> Redux DevTools', () => {
  const stub = () => {
    const connections: Record<string, ReturnType<typeof fakeConnection>> = {};
    const connect = vi.fn((options: ConnectOptions) => {
      connections[options.name] = fakeConnection();
      return connections[options.name];
    });
    (globalThis as DevtoolsGlobal).__REDUX_DEVTOOLS_EXTENSION__ = { connect };
    return { connect, connections };
  };

  afterEach(() => {
    delete (globalThis as DevtoolsGlobal).__REDUX_DEVTOOLS_EXTENSION__;
  });

  it('reports the violations of the first run to the panel', async () => {
    const { connections } = stub();
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    const connection = connections['validations-property-test'];
    await vi.waitFor(() => expect(connection.init).toHaveBeenCalled());
    expect(connection.init).toHaveBeenCalledWith([...context.violationsContext.values()]);
  });

  it("sends the violation with the editor's own fields on it", async () => {
    const { connections } = stub();
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    const connection = connections['validations-property-test'];
    await vi.waitFor(() => expect(connection.init).toHaveBeenCalled());
    const [state] = connection.init.mock.calls[0];

    expect(state[0]).toBe([...context.violationsContext.values()][0]);
    expect(state[0].display).toBe('block');
    expect(state[0].range).toBeInstanceOf(Range);
  });

  it('reports a later run as an action, so the panel can diff it against the previous one', async () => {
    const { connections } = stub();
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    const connection = connections['validations-property-test'];
    await vi.waitFor(() => expect(connection.send).toHaveBeenCalled());
    expect(connection.send).toHaveBeenCalledWith({ type: 'violations/updated' }, [
      expect.objectContaining({ rule: 'PARAGRAPH_MUST_NOT_SHOUT' }),
    ]);
  });

  it('gives every editor on a page its own panel instance', async () => {
    const { connect, connections } = stub();

    document.body.innerHTML = `
      <clippy-context id="editor-1"><div slot="value">${CONTENT}</div><clippy-content></clippy-content></clippy-context>
      <clippy-context id="editor-2"><div slot="value">${CONTENT}</div><clippy-content></clippy-content></clippy-context>`;
    const contexts = [...document.querySelectorAll('clippy-context')] as Context[];
    await Promise.all(contexts.map((context) => context.updateComplete));
    await Promise.all(contexts.map((context) => settled(context)));

    expect(connect).toHaveBeenCalledTimes(2);
    expect(Object.keys(connections)).toEqual(['editor-1', 'editor-2']);
    expect(connections['editor-1'].init).toHaveBeenCalledWith([...contexts[0].violationsContext.values()]);
  });

  it('validates as usual when the extension is not installed', async () => {
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });
});
