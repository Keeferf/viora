import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap select-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-transparent active:translate-y-px';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_0_24px_-6px_var(--accent)]',
  secondary:
    'bg-raised text-primary border-line hover:bg-hover hover:border-muted',
  ghost: 'bg-transparent text-secondary hover:bg-hover hover:text-primary',
  danger: 'bg-danger text-white hover:bg-danger-hover',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: '',
  lg: 'px-8 py-4 text-[15px]',
};

const shapes: Record<NonNullable<ButtonProps['shape']>, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-[10px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      shape = 'pill',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const combinedClass = [
      base,
      variants[variant],
      sizes[size],
      shapes[shape],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={combinedClass}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin h-4 w-4" />
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
