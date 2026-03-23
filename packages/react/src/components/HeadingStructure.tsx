import { createComponent } from '@lit/react';
import { HeadingStructure } from '@nl-design-system-community/editor';
import * as React from 'react';

export const ClippyHeadingStructure = createComponent({
  elementClass: HeadingStructure,
  react: React,
  tagName: 'clippy-heading-structure',
});
