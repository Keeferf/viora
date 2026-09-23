import { type ReactNode } from 'react';
import { ShapeGrid } from '@/components/ui';

interface AppLayoutProps {
  children: ReactNode;
  topBar?: ReactNode;
  className?: string;
  animated?: boolean;
}

export function AppLayout({ children, topBar, className = '', animated = true }: AppLayoutProps) {
  return (
    <div className={`relative flex h-dvh flex-col overflow-hidden bg-base text-primary ${className}`}>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {animated && (
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_90%_80%_at_50%_20%,black_30%,transparent_75%)]">
            <ShapeGrid
              direction="down"
              hoverTrailAmount={0}
              fadeColor="transparent"
              className="absolute inset-0"
            />
          </div>
        )}
      </div>
      {topBar}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto">{children}</div>
    </div>
  );
}
