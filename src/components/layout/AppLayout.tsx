import { type ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return <div className={`flex flex-col h-full min-h-screen bg-base text-primary ${className}`}>{children}</div>;
}
