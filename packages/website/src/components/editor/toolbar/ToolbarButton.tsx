import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { toolbarButtonStyling } from './ToolbarButton.css.ts';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  children: ReactNode;
}

function ToolbarButton({ children, className, pressed, ...props }: Readonly<ToolbarButtonProps>) {
  return (
    <button
      className={clsx(toolbarButtonStyling, { '--active': pressed }, className)}
      {...props}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}

export default ToolbarButton;
