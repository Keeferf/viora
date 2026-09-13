import { type ReactNode } from 'react';
import { LogOut, Video } from 'lucide-react';
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
    <header className="h-14 flex items-center justify-between px-5 bg-surface border-b border-line relative z-[200] shrink-0">
      <div className="flex items-center gap-4">
        {left}
        <div className="flex items-center gap-2">
          <Video size={20} className="text-accent" />
          <div>
            {title && <h1 className="text-base font-semibold leading-tight">{title}</h1>}
            {subtitle && <p className="text-xs text-secondary leading-tight">{subtitle}</p>}
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
    </header>
  );
}
