/// <reference types="react" />

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'clippy-button': React.HTMLAttributes<HTMLElement> & {
        'icon-only'?: '' | boolean;
        purpose?: 'primary' | 'secondary' | 'subtle';
        size?: 'medium' | 'small';
        type?: 'button' | 'reset' | 'submit';
      };
      'clippy-icon': React.HTMLAttributes<HTMLElement> & {
        slot?: string;
      };
    }
  }
}
