import type { Gutter, ValidationsList } from '@nl-design-system-community/editor';
import type { AccessibilityNotifications } from '@nl-design-system-community/editor/accessibility-notifications';
import { ClippyHub, type ClippyHubOptions } from '@nl-design-system-community/editor/hub';
import { useCallback, useEffect, useRef, useState } from 'react';

export type UseClippyHubOptions = Omit<ClippyHubOptions, 'target'>;

export function useClippyHub<T extends HTMLElement = HTMLDivElement>(options: UseClippyHubOptions) {
  const { identifier, validations } = options;
  const targetRef = useRef<T>(null);
  const triggerRef = useRef<AccessibilityNotifications>(null);
  const gutterRef = useRef<Gutter>(null);
  const listRef = useRef<ValidationsList>(null);
  const hubRef = useRef<ClippyHub | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [hub, setHub] = useState<ClippyHub | null>(null);

  useEffect(() => {
    const current = hubRef.current;
    if (!current) return;
    current.validations = validations;
    current.validate().catch(console.error);
  }, [validations]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      throw new Error(`[useClippyHub] Pass targetRef to the element that hub "${identifier}" validates.`);
    }

    const created = new ClippyHub({
      adaptViolations: (violationsMap) => optionsRef.current.adaptViolations?.(violationsMap) ?? violationsMap,
      focusViolation: (violation) => {
        const { focusViolation } = optionsRef.current;
        if (focusViolation) {
          focusViolation(violation);
        } else {
          violation.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      identifier,
      target,
      validations: optionsRef.current.validations,
    });
    if (gutterRef.current) {
      gutterRef.current.contentElement = target;
    }
    created.connect({
      gutter: gutterRef.current,
      list: listRef.current,
      trigger: triggerRef.current,
    });
    created.validate().catch(console.error);
    hubRef.current = created;
    setHub(created);

    return () => {
      created.destroy();
      hubRef.current = null;
      setHub(null);
    };
  }, [identifier]);

  const scheduleValidation = useCallback(() => hubRef.current?.scheduleValidation(), []);

  return { gutterRef, hub, listRef, scheduleValidation, targetRef, triggerRef };
}
