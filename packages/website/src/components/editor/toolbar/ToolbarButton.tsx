import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { toolbarButtonStyling } from './ToolbarButton.css.ts';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  children: ReactNode;
}

function ToolbarButton({ children, className, isActive, ...props }: Readonly<ToolbarButtonProps>) {
  return (
    <button
      className={clsx(toolbarButtonStyling, { '--active': isActive }, className)}
      {...props}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export default ToolbarButton;
