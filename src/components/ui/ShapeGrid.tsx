import { useEffect, useRef, type CSSProperties } from 'react';

interface ShapeGridProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: string | CanvasGradient | CanvasPattern;
  squareSize?: number;
  hoverFillColor?: string | CanvasGradient | CanvasPattern;
  hoverTrailAmount?: number;
  fadeColor?: string;
  className?: string;
  style?: CSSProperties;
}

// ponytail: square-only trim of React Bits ShapeGrid (hexagon/circle/triangle branches removed — add back if needed)
export function ShapeGrid({
  direction = 'right',
  speed = 0.6,
  borderColor,
  squareSize = 44,
  hoverFillColor,
  hoverTrailAmount = 8,
  fadeColor = '#0d0d0d',
  className = '',
  style,
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);
  const trailCells = useRef<{ x: number; y: number }[]>([]);
  const cellOpacities = useRef(new Map<string, number>());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Colors come from theme CSS vars so the grid follows light/dark; refresh on theme switch.
    const resolveColors = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        border:
          borderColor ?? (styles.getPropertyValue('--grid-line').trim() || 'rgba(232, 230, 227, 0.08)'),
        hover:
          hoverFillColor ?? (styles.getPropertyValue('--grid-hover').trim() || 'rgba(125, 122, 188, 0.5)'),
      };
    };
    const colors = { current: resolveColors() };
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawStatic = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = colors.current.border;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let x = 0; x < w; x += squareSize) {
        for (let y = 0; y < h; y += squareSize) ctx.strokeRect(x, y, squareSize, squareSize);
      }
    };

    const themeObserver = new MutationObserver(() => {
      colors.current = resolveColors();
      if (prefersReducedMotion) drawStatic();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (prefersReducedMotion) {
      drawStatic();
      return () => themeObserver.disconnect();
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(w / squareSize) + 3;
      const rows = Math.ceil(h / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;
          const key = `${col},${row}`;
          const alpha = cellOpacities.current.get(key);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors.current.hover;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = colors.current.border;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.sqrt(w ** 2 + h ** 2) / 2,
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, fadeColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();
      if (hoveredSquareRef.current) {
        targets.set(`${hoveredSquareRef.current.x},${hoveredSquareRef.current.y}`, 1);
      }
      for (let i = 0; i < trailCells.current.length; i++) {
        const t = trailCells.current[i];
        const key = `${t.x},${t.y}`;
        if (!targets.has(key)) targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
      }
      for (const key of targets.keys()) {
        if (!cellOpacities.current.has(key)) cellOpacities.current.set(key, 0);
      }
      for (const [key, opacity] of cellOpacities.current) {
        const next = opacity + ((targets.get(key) || 0) - opacity) * 0.15;
        if (next < 0.005) cellOpacities.current.delete(key);
        else cellOpacities.current.set(key, next);
      }
    };

    const updateAnimation = () => {
      const v = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - v + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + v + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + v + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - v + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - v + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - v + squareSize) % squareSize;
          break;
      }
      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const pushTrail = () => {
      if (hoveredSquareRef.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquareRef.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const col = Math.floor((event.clientX - rect.left - offsetX) / squareSize);
      const row = Math.floor((event.clientY - rect.top - offsetY) / squareSize);
      if (!hoveredSquareRef.current || hoveredSquareRef.current.x !== col || hoveredSquareRef.current.y !== row) {
        pushTrail();
        hoveredSquareRef.current = { x: col, y: row };
      }
    };

    const handleMouseLeave = () => {
      pushTrail();
      hoveredSquareRef.current = null;
    };

    // ponytail: window-level tracking — the canvas sits under a pointer-events-none layer so it never gets its own mouse events
    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = false;
    let isPageVisible = !document.hidden;
    const tryStart = () => {
      if (isVisible && isPageVisible && !requestRef.current) {
        requestRef.current = requestAnimationFrame(updateAnimation);
      }
    };
    const tryStop = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) tryStart();
      else tryStop();
    });
    io.observe(canvas);
    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    tryStart();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      tryStop();
      themeObserver.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, hoverTrailAmount, fadeColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', border: 'none', ...style }}
    />
  );
}
