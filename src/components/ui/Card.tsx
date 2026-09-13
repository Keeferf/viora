import { type ReactNode, type CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', style, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };
  return (
    <div
      className={`bg-surface border border-line rounded-2xl shadow-lg ${paddingClasses[padding]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`px-6 pt-5 pb-4 border-b border-line ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-display text-base text-primary ${className}`}>{children}</h3>;
}

export function CardSubtitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-[13px] text-secondary mt-1 ${className}`}>{children}</p>;
}

export function CardBody({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`px-6 py-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`px-6 pt-4 pb-5 border-t border-line flex justify-end gap-3 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
