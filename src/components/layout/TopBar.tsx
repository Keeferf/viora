import { type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../ui';
import { useSettingsStore } from '../../store';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  showSettings?: boolean;
  onLeave?: () => void;
}

export function TopBar({ title, subtitle, left, right, showSettings = true, onLeave }: TopBarProps) {
  const { theme, dispatch } = useSettingsStore();

  const toggleTheme = () => {
    const themes: ('dark' | 'light' | 'system')[] = ['dark', 'light', 'system'];
    const current = themes.indexOf(theme);
    dispatch({ type: 'SET_THEME', payload: themes[(current + 1) % 3] });
  };

  const themeIcons = { dark: '☀️', light: '🌙', system: '💻' };
  const themeLabels = { dark: 'Light', light: 'System', system: 'Dark' };

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-surface border-b border-line relative z-[200] shrink-0">
      <div className="flex items-center gap-4">
        {left}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎥</span>
          <div>
            {title && <h1 className="text-base font-semibold leading-tight">{title}</h1>}
            {subtitle && <p className="text-xs text-secondary leading-tight">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${themeLabels[theme]} mode`}
            title={`${themeLabels[theme]} mode`}
          >
            {themeIcons[theme]}
          </Button>
        )}
        {onLeave && (
          <Button variant="ghost" size="sm" onClick={onLeave} aria-label="Leave room" title="Leave">
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </header>
  );
}
