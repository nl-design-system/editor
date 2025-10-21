import { createComponent } from '@lit/react';
import { Editor as EditorWC } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyEditor = createComponent({
  elementClass: EditorWC,
  react: React,
  tagName: 'clippy-editor',
});
