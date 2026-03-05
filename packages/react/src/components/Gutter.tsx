import { createComponent } from '@lit/react';
import { Gutter } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyGutter = createComponent({
  elementClass: Gutter,
  react: React,
  tagName: 'clippy-validations-gutter',
});
