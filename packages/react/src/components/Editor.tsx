import { createComponent } from '@lit/react';
import { Editor } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyEditor = createComponent({
  elementClass: Editor,
  react: React,
  tagName: 'clippy-editor',
});
