import { createComponent } from '@lit/react';
import { ValidationsList } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyValidationsList = createComponent({
  elementClass: ValidationsList,
  react: React,
  tagName: 'clippy-validations-list',
});
