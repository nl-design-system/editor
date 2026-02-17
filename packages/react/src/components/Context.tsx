import { createComponent } from '@lit/react';
import { Context } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyContext = createComponent({
  elementClass: Context,
  react: React,
  tagName: 'clippy-context',
});
