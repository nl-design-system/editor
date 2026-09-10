import type { Violation as CoreViolation } from '@nl-design-system-community/clippy-a11y-validator';
import type { validationInteractionMode } from '@/constants';

export type ValidationInteractionMode = (typeof validationInteractionMode)[keyof typeof validationInteractionMode];

/**
 * A violation reported by `@nl-design-system-community/clippy-a11y-validator`, extended with what
 * the editor needs to render and act on it.
 */
export type Violation = CoreViolation & {
  /** Replaces the default "Correct" label, for rules whose fix is an edit rather than a correction. */
  customCorrectLabel?: string;
  /** The range this violation covers, used to position and focus the issue. */
  range?: Range;
};

export type ViolationsMap = Map<Range, Violation>;

export type {
  CorrectValidationFunction,
  ResolvedMessages,
  ValidationScope,
  ValidationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';
