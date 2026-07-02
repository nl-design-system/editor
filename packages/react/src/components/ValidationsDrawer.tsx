import { createComponent } from '@lit/react';
import { ValidationsDrawer } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyValidationsDrawer = createComponent({
  elementClass: ValidationsDrawer,
  react: React,
  tagName: 'clippy-validations-drawer',
});
