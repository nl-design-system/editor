import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ViolationsMap } from '@/types/validation';
import { ClippyHub, type ClippyHubViews } from '@/hub';

export interface ClippyHubControllerOptions {
  identifier: () => string;
  validations: () => readonly Validation[] | undefined;
  views: () => ClippyHubViews;
  colorSchemeElement?: () => HTMLElement;
  adaptViolations?: (violationsMap: ViolationsMap) => ViolationsMap;
}

export class ClippyHubController implements ReactiveController {
  readonly #options: ClippyHubControllerOptions;
  #hub?: ClippyHub;

  constructor(host: ReactiveControllerHost, options: ClippyHubControllerOptions) {
    this.#options = options;
    host.addController(this);
  }

  connect(target: HTMLElement): ClippyHub | undefined {
    this.#hub?.destroy();
    const { adaptViolations, colorSchemeElement, identifier, validations, views } = this.#options;
    try {
      this.#hub = new ClippyHub({
        adaptViolations,
        colorSchemeElement: colorSchemeElement?.(),
        identifier: identifier(),
        target,
        validations: validations(),
      });
    } catch (error) {
      this.#hub = undefined;
      console.error(error);
      return undefined;
    }
    this.#hub.connect(views());
    return this.#hub;
  }

  readonly scheduleValidation = (): void => {
    this.#hub?.scheduleValidation();
  };

  readonly validate = (): void => {
    this.#hub?.validate().catch(console.error);
  };

  updateValidations(): void {
    if (!this.#hub) return;
    this.#hub.validations = this.#options.validations();
    this.validate();
  }

  hostDisconnected(): void {
    this.#hub?.destroy();
    this.#hub = undefined;
  }
}
