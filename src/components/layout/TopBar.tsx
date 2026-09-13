import { type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onLeave?: () => void;
}

export function TopBar({ title, subtitle, left, right, onLeave }: TopBarProps) {
  return (
    <header className="sticky top-0 h-14 flex items-center justify-between px-5 bg-base/85 backdrop-blur-md border-b border-line z-[200] shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {left}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent font-display text-[13px] text-white leading-none pt-px">
            V
          </span>
          <div className="min-w-0">
            {title && (
              <h1 className="text-sm font-semibold leading-tight truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-secondary leading-tight flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember animate-[live-ping_2s_ease-out_infinite]" />
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        {onLeave && (
          <Button variant="ghost" size="sm" onClick={onLeave} aria-label="Leave room" title="Leave">
            <LogOut size={18} />
          </Button>
        )}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-1px] left-0 h-px w-full bg-gradient-to-r from-accent via-ember to-transparent opacity-60"
      />
    </header>
  );
}
