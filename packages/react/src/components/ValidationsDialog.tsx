import { createComponent } from '@lit/react';
import { ValidationsDialog } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyValidationsDialog = createComponent({
  elementClass: ValidationsDialog,
  react: React,
  tagName: 'clippy-validations-dialog',
});
