import { createComponent } from '@lit/react';
import { AccessibilityNotifications } from '@nl-design-system-community/editor/accessibility-notifications';
import * as React from 'react';

export const ClippyAccessibilityNotifications = createComponent({
  elementClass: AccessibilityNotifications,
  react: React,
  tagName: 'clippy-accessibility-notifications',
});
