import { createComponent } from '@lit/react';
import { EditorContentWrapper } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyEditorContentWrapper = createComponent({
  elementClass: EditorContentWrapper,
  react: React,
  tagName: 'clippy-editor-content-wrapper',
});
