import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export function Select({
  options,
  value,
  onChange,
  label,
  hint,
  error,
  placeholder = 'Select…',
  disabled = false,
  className = '',
  id,
  style,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listId = `${selectId}-list`;
  const errorId = error ? `${selectId}-error` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;

  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [activeIndex, setActiveIndex] = useState(selectedIndex < 0 ? 0 : selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const firstEnabled = () => {
    const index = options.findIndex((option) => !option.disabled);
    return index < 0 ? 0 : index;
  };

  const step = (direction: number) => {
    if (!options.length) return;
    let index = activeIndex;
    for (let moved = 0; moved < options.length; moved++) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) break;
    }
    setActiveIndex(index);
  };

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled());
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) step(e.key === 'ArrowDown' ? 1 : -1);
      else openList();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) choose(activeIndex);
      else openList();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`flex flex-col gap-1.5 ${className}`} style={style}>
      {label && (
        <label
          htmlFor={selectId}
          id={`${selectId}-label`}
          className="text-[13px] font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={selectId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-activedescendant={open ? `${selectId}-opt-${activeIndex}` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId ?? ''} ${hintId ?? ''}`.trim() || undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onTriggerKeyDown}
          className={[
            'flex w-full items-center justify-between gap-2 px-4 py-3 pr-3 text-left text-sm font-medium',
            'bg-base border rounded-[10px] text-primary outline-hidden transition-all cursor-pointer',
            'hover:border-muted focus:border-focus focus:ring-2 focus:ring-accent/25',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-danger focus:ring-danger/20' : 'border-line',
          ].join(' ')}
        >
          <span className={`truncate ${selected ? '' : 'text-muted'}`}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={label ? `${selectId}-label` : undefined}
            className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 animate-[fade-in_120ms_ease] overflow-y-auto rounded-[14px] border border-line bg-surface p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${selectId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={[
                    'flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-sm',
                    option.disabled
                      ? 'cursor-not-allowed text-muted'
                      : 'cursor-pointer text-primary',
                    isActive && !option.disabled ? 'bg-hover' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-accent" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
