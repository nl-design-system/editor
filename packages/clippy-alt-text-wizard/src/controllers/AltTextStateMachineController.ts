import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { type Actor, type AnyStateMachine, type SnapshotFrom, createActor } from 'xstate';

/**
 * Lit Reactive Controller that hosts an XState v5 actor.
 *
 * - Creates the actor on host connect.
 * - Subscribes to snapshot changes → triggers `host.requestUpdate()`.
 * - Stops the actor on host disconnect.
 *
 * @template TMachine - The XState state machine type.
 */
export class AltTextStateMachineController<TMachine extends AnyStateMachine> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly machine: TMachine;
  private actor: Actor<TMachine> | null = null;

  /** The latest XState snapshot. Undefined before the host connects. */
  snapshot: SnapshotFrom<TMachine> | undefined;

  constructor(host: ReactiveControllerHost, machine: TMachine) {
    this.host = host;
    this.machine = machine;
    host.addController(this);
  }

  hostConnected() {
    this.actor = createActor(this.machine);

    this.actor.subscribe((snapshot) => {
      this.snapshot = snapshot;
      this.host.requestUpdate();
    });

    this.actor.start();
    this.snapshot = this.actor.getSnapshot();
  }

  hostDisconnected() {
    this.actor?.stop();
    this.actor = null;
  }

  /**
   * Send an event to the running XState actor.
   * Silently ignored when the actor is not yet started.
   */
  send(event: Parameters<Actor<TMachine>['send']>[0]) {
    this.actor?.send(event);
  }

  /**
   * Stop the current actor and start a fresh one from the initial state.
   */
  restart() {
    this.actor?.stop();
    this.actor = createActor(this.machine);
    this.actor.subscribe((snapshot) => {
      this.snapshot = snapshot;
      this.host.requestUpdate();
    });
    this.actor.start();
    this.snapshot = this.actor.getSnapshot();
  }
}
