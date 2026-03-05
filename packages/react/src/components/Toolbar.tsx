import { createComponent } from '@lit/react';
import { Toolbar } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyToolbar = createComponent({
  elementClass: Toolbar,
  react: React,
  tagName: 'clippy-toolbar',
});
