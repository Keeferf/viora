import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LogOut, Minus, Square, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onLeave?: () => void;
}

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export function TopBar({ title, subtitle, left, right, onLeave }: TopBarProps) {
  const handleDoubleClick = useCallback(() => {
    if (isTauri()) getCurrentWindow().toggleMaximize().catch(() => {});
  }, []);

  return (
    <header
      data-tauri-drag-region
      onDoubleClick={handleDoubleClick}
      className="relative z-[200] h-12 flex items-center justify-between pl-4 pr-0 bg-base border-b border-line shrink-0 select-none"
    >
      <div data-tauri-drag-region className="flex items-center gap-3 min-w-0">
        {left}
        <div data-tauri-drag-region className="flex items-center gap-2.5 min-w-0">
          <span
            data-tauri-drag-region
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent font-display text-[13px] text-white leading-none pt-px"
          >
            V
          </span>
          <span
            data-tauri-drag-region
            className="font-display uppercase tracking-wide text-[15px] leading-none pt-px"
          >
            Viora
          </span>
          {(title || subtitle) && (
            <>
              <span aria-hidden className="w-px h-5 bg-line shrink-0" />
              <div data-tauri-drag-region className="min-w-0 leading-tight">
                {title && <h1 className="text-[13px] font-semibold truncate">{title}</h1>}
                {subtitle && (
                  <p className="text-xs text-secondary truncate flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember animate-[live-ping_2s_ease-out_infinite] shrink-0" />
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center h-full shrink-0">
        {(right || onLeave) && (
          <div className="flex items-center gap-1 mr-1">
            {right}
            {onLeave && (
              <Button variant="ghost" size="sm" onClick={onLeave} aria-label="Leave room" title="Leave">
                <LogOut size={16} />
              </Button>
            )}
          </div>
        )}
        {isTauri() && <WindowControls />}
      </div>
    </header>
  );
}

function WindowControls() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    getCurrentWindow().isMaximized().then(setMaximized).catch(() => {});
  }, []);

  const run = (fn: () => Promise<void>) => () => fn().catch(() => {});
  const toggle = async () => {
    await getCurrentWindow().toggleMaximize();
    setMaximized(await getCurrentWindow().isMaximized().catch(() => false));
  };

  const btn =
    'flex items-center justify-center w-[46px] h-full text-secondary transition-colors cursor-pointer hover:bg-hover hover:text-primary';
  const Icon = maximized ? Copy : Square;

  return (
    <div className="flex items-stretch h-full">
      <button
        onClick={run(() => getCurrentWindow().minimize())}
        aria-label="Minimize"
        title="Minimize"
        className={btn}
      >
        <Minus size={15} />
      </button>
      <button onClick={() => toggle().catch(() => {})} aria-label="Maximize" title="Maximize" className={btn}>
        <Icon size={13} />
      </button>
      <button
        onClick={run(() => getCurrentWindow().close())}
        aria-label="Close"
        title="Close"
        className={`${btn} hover:!bg-danger hover:!text-white`}
      >
        <X size={16} />
      </button>
    </div>
  );
}
