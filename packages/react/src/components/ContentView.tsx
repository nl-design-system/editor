import { createComponent } from '@lit/react';
import { ContentView } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyContentView = createComponent({
  elementClass: ContentView,
  react: React,
  tagName: 'clippy-content-views',
});
