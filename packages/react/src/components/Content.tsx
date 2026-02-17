import { createComponent } from '@lit/react';
import { Content } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyContent = createComponent({
  elementClass: Content,
  react: React,
  tagName: 'clippy-content',
});
