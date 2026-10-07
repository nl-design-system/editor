import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Violation, ViolationsMap } from '@/types/validation';

type DevtoolsConnection = {
  init: (state: Violation[]) => void;
  send: (action: { type: string }, state: Violation[]) => void;
  subscribe?: (listener: (message: { type: string }) => void) => void;
  unsubscribe?: () => void;
};

type DevtoolsExtension = {
  connect: (options: { name: string }) => DevtoolsConnection;
};

const devtoolsExtension = (): DevtoolsExtension | undefined =>
  (globalThis as { __REDUX_DEVTOOLS_EXTENSION__?: DevtoolsExtension }).__REDUX_DEVTOOLS_EXTENSION__;

export class ViolationsDevtoolsController implements ReactiveController {
  private connection?: DevtoolsConnection;
  private latest: Violation[] = [];
  private readonly name: () => string;

  constructor(host: ReactiveControllerHost, name: () => string) {
    this.name = name;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.connection?.unsubscribe?.();
    this.connection = undefined;
  }

  send(violations: ViolationsMap): void {
    const isFirstRun = this.connection === undefined;
    this.connection ??= this.connect();
    if (!this.connection) return;

    this.latest = [...violations.values()];
    if (isFirstRun) {
      this.connection.init(this.latest);
    } else {
      this.connection.send({ type: 'violations/updated' }, this.latest);
    }
  }

  private connect(): DevtoolsConnection | undefined {
    const connection = devtoolsExtension()?.connect({ name: this.name() });

    // A reopened panel has lost the state it was given and reports no store until one starts over.
    connection?.subscribe?.((message) => {
      if (message.type === 'START') connection.init(this.latest);
    });
    return connection;
  }
}
