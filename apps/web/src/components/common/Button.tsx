import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'bg-surface-tertiary text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
