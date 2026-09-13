import { type ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return (
    <div className={`relative flex flex-col h-full min-h-screen bg-base text-primary overflow-x-clip ${className}`}>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 stage-grid" />
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-accent/10 blur-[80px] will-change-transform" />
        <div className="absolute -bottom-48 -right-32 h-[420px] w-[420px] rounded-full bg-ember/10 blur-[80px] will-change-transform" />
      </div>
      <div className="relative flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
