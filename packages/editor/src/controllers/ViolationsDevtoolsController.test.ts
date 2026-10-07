import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Violation, ViolationsMap } from '@/types/validation';
import { ViolationsDevtoolsController } from './ViolationsDevtoolsController';

type ConnectOptions = { name: string };
type DevtoolsGlobal = {
  __REDUX_DEVTOOLS_EXTENSION__?: { connect: (options: ConnectOptions) => unknown };
};

function stubExtension() {
  const connected: string[] = [];
  const listeners: ((message: { type: string }) => void)[] = [];
  const connection = {
    init: vi.fn(),
    send: vi.fn(),
    subscribe: vi.fn((listener: (message: { type: string }) => void) => listeners.push(listener)),
    unsubscribe: vi.fn(),
  };
  const connect = vi.fn((options: ConnectOptions) => {
    connected.push(options.name);
    return connection;
  });
  (globalThis as DevtoolsGlobal).__REDUX_DEVTOOLS_EXTENSION__ = { connect };
  return { connect, connected, connection, listeners };
}

function fakeHost(): ReactiveControllerHost & { controllers: ReactiveController[] } {
  const controllers: ReactiveController[] = [];
  return {
    addController: (controller: ReactiveController) => controllers.push(controller),
    controllers,
    removeController: () => {},
    requestUpdate: () => {},
    updateComplete: Promise.resolve(true),
  };
}

function violations(count: number): ViolationsMap {
  const map: ViolationsMap = new Map();
  for (let index = 0; index < count; index++) {
    const element = document.createElement('p');
    element.textContent = `Alinea ${index}`;
    document.body.appendChild(element);
    const range = document.createRange();
    range.selectNode(element);
    map.set(range, {
      display: 'block',
      element,
      messages: { error: 'Deze alinea is leeg' },
      range,
      rule: 'paragraph-should-not-be-empty',
      scope: 'element',
      severity: 'warning',
    } satisfies Violation);
  }
  return map;
}

describe('ViolationsDevtoolsController', () => {
  afterEach(() => {
    delete (globalThis as DevtoolsGlobal).__REDUX_DEVTOOLS_EXTENSION__;
    document.body.innerHTML = '';
  });

  it('does nothing when the extension is not installed', () => {
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');

    expect(() => controller.send(violations(1))).not.toThrow();
  });

  it('connects under the editor identifier, so each editor is its own panel instance', () => {
    const { connect, connected } = stubExtension();

    new ViolationsDevtoolsController(fakeHost(), () => 'editor-1').send(violations(1));
    new ViolationsDevtoolsController(fakeHost(), () => 'editor-2').send(violations(1));

    expect(connect).toHaveBeenCalledTimes(2);
    expect(connected).toEqual(['editor-1', 'editor-2']);
  });

  it('sends the violations as they are, in an array', () => {
    const { connection } = stubExtension();
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');
    const map = violations(2);

    controller.send(map);

    expect(connection.init).toHaveBeenCalledWith([...map.values()]);
  });

  it('keeps the display and the range the editor adds', () => {
    const { connection } = stubExtension();
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');

    controller.send(violations(1));

    const [state] = connection.init.mock.calls[0];
    expect(state[0].display).toBe('block');
    expect(state[0].range).toBeInstanceOf(Range);
  });

  it('initialises on the first run and sends every run after it', () => {
    const { connect, connection } = stubExtension();
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');
    const second = violations(2);

    controller.send(violations(1));
    controller.send(second);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(connection.init).toHaveBeenCalledTimes(1);
    expect(connection.send).toHaveBeenCalledWith({ type: 'violations/updated' }, [...second.values()]);
  });

  it('re-initialises when the reopened panel asks it to start', () => {
    const { connection, listeners } = stubExtension();
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');
    controller.send(violations(2));
    const [reported] = connection.init.mock.calls[0];
    connection.init.mockClear();

    listeners.forEach((listener) => listener({ type: 'START' }));

    expect(connection.init).toHaveBeenCalledWith(reported);
  });

  it('ignores panel messages it has no answer for', () => {
    const { connection, listeners } = stubExtension();
    const controller = new ViolationsDevtoolsController(fakeHost(), () => 'editor-1');
    controller.send(violations(1));
    connection.init.mockClear();

    listeners.forEach((listener) => listener({ type: 'DISPATCH' }));

    expect(connection.init).not.toHaveBeenCalled();
  });

  it('unsubscribes when the host goes away', () => {
    const { connection } = stubExtension();
    const host = fakeHost();
    const controller = new ViolationsDevtoolsController(host, () => 'editor-1');
    controller.send(violations(1));

    host.controllers.forEach((registered) => registered.hostDisconnected?.());

    expect(connection.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
