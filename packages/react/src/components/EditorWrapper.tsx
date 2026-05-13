import { createComponent } from '@lit/react';
import { EditorWrapper } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyEditorWrapper = createComponent({
  elementClass: EditorWrapper,
  react: React,
  tagName: 'clippy-editor-wrapper',
});
