// Dev-only drag + resize wrapper for portfolio slides.
//
// Usage:
//   <Movable id="model-header" defaultX={100} defaultY={80} defaultW={1720}>
//     <div>...</div>
//   </Movable>
//
// Out of edit mode, the wrapper just renders the child at its persisted (or
// default) position. With `?edit=1` in the URL, the wrapper shows a dashed
// outline, lets you drag to move, and shows resize handles at corners + edges.
//
// Position changes save to localStorage under PORTFOLIO_MOVABLE_KEY. Run
// `dumpMovableJSON()` in the dev console to grab the current state for baking
// back into source defaults.

import React, { useCallback, useEffect, useRef, useState } from 'react';

export const PORTFOLIO_MOVABLE_KEY = 'portfolio-movable-v1';

type Pos = {
  x: number;
  y: number;
  w?: number | 'auto';
  h?: number | 'auto';
};

const readAll = (): Record<string, Pos> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PORTFOLIO_MOVABLE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveOne = (id: string, pos: Pos) => {
  if (typeof window === 'undefined') return;
  const all = readAll();
  all[id] = pos;
  window.localStorage.setItem(PORTFOLIO_MOVABLE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('movable:change'));
};

if (typeof window !== 'undefined') {
  // Console helper — paste output back to me to bake into source.
  (window as unknown as { dumpMovableJSON?: () => string }).dumpMovableJSON = () => {
    const json = JSON.stringify(readAll(), null, 2);
    // eslint-disable-next-line no-console
    console.log(json);
    return json;
  };
}

const useEditMode = () => {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('edit');
  });
  useEffect(() => {
    const recheck = () =>
      setEnabled(new URLSearchParams(window.location.search).has('edit'));
    window.addEventListener('popstate', recheck);
    window.addEventListener('hashchange', recheck);
    return () => {
      window.removeEventListener('popstate', recheck);
      window.removeEventListener('hashchange', recheck);
    };
  }, []);
  return enabled;
};

type DragMode = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const HANDLE_SIZE = 14;

export const Movable: React.FC<{
  id: string;
  defaultX: number;
  defaultY: number;
  defaultW?: number | 'auto';
  defaultH?: number | 'auto';
  children: React.ReactNode;
  zIndex?: number;
}> = ({ id, defaultX, defaultY, defaultW = 'auto', defaultH = 'auto', children, zIndex }) => {
  const editMode = useEditMode();
  const def: Pos = { x: defaultX, y: defaultY, w: defaultW, h: defaultH };
  const [pos, setPos] = useState<Pos>(() => readAll()[id] || def);
  const posRef = useRef(pos);
  posRef.current = pos;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => {
      const stored = readAll()[id];
      if (stored) setPos(stored);
    };
    window.addEventListener('movable:change', onChange);
    return () => window.removeEventListener('movable:change', onChange);
  }, [id]);

  const beginDrag = useCallback(
    (e: React.MouseEvent, mode: DragMode) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      // Find the slide canvas root (1920px wide pre-scale) and compute scale.
      const canvasEl =
        wrapperRef.current?.closest<HTMLElement>('[data-osd-canvas]') ||
        wrapperRef.current?.parentElement;
      const canvasRect = canvasEl?.getBoundingClientRect();
      const scale = canvasRect && canvasRect.width > 0 ? canvasRect.width / 1920 : 1;

      const startMx = e.clientX;
      const startMy = e.clientY;
      const start: Pos = { ...posRef.current };
      const startW = typeof start.w === 'number' ? start.w : wrapperRef.current?.offsetWidth ?? 0;
      const startH = typeof start.h === 'number' ? start.h : wrapperRef.current?.offsetHeight ?? 0;

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startMx) / scale;
        const dy = (ev.clientY - startMy) / scale;
        const next: Pos = { ...start };
        if (mode === 'move') {
          next.x = Math.round(start.x + dx);
          next.y = Math.round(start.y + dy);
        } else {
          // resize — convert to numeric w/h
          let nw = startW;
          let nh = startH;
          let nx = start.x;
          let ny = start.y;
          if (mode.includes('e')) nw = Math.max(40, Math.round(startW + dx));
          if (mode.includes('w')) {
            nw = Math.max(40, Math.round(startW - dx));
            nx = Math.round(start.x + dx);
          }
          if (mode.includes('s')) nh = Math.max(40, Math.round(startH + dy));
          if (mode.includes('n')) {
            nh = Math.max(40, Math.round(startH - dy));
            ny = Math.round(start.y + dy);
          }
          next.w = nw;
          next.h = nh;
          next.x = nx;
          next.y = ny;
        }
        setPos(next);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        saveOne(id, posRef.current);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [editMode, id],
  );

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: '#ffffff',
    border: '1.5px solid #d62828',
    boxSizing: 'border-box',
    zIndex: 10,
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: pos.w,
        height: pos.h,
        zIndex,
        outline: editMode ? '1px dashed rgba(214,40,40,0.6)' : 'none',
        outlineOffset: editMode ? '-1px' : '0',
        cursor: editMode ? 'move' : 'default',
      }}
      onMouseDown={editMode ? (e) => beginDrag(e, 'move') : undefined}
    >
      {children}
      {editMode && (
        <>
          <div
            onMouseDown={(e) => beginDrag(e, 'nw')}
            style={{ ...handleStyle, top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nwse-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'ne')}
            style={{ ...handleStyle, top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nesw-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'sw')}
            style={{ ...handleStyle, bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nesw-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'se')}
            style={{ ...handleStyle, bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nwse-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'n')}
            style={{ ...handleStyle, top: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 's')}
            style={{ ...handleStyle, bottom: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'w')}
            style={{ ...handleStyle, top: '50%', left: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2, cursor: 'ew-resize' }}
          />
          <div
            onMouseDown={(e) => beginDrag(e, 'e')}
            style={{ ...handleStyle, top: '50%', right: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2, cursor: 'ew-resize' }}
          />
          {/* Coord readout pinned bottom-right of the box */}
          <div
            style={{
              position: 'absolute',
              bottom: -28,
              right: 0,
              fontSize: 11,
              fontFamily: 'ui-monospace, Menlo, monospace',
              color: '#d62828',
              background: '#ffffff',
              padding: '2px 6px',
              border: '1px solid #d62828',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {`${id} · ${pos.x},${pos.y}${
              typeof pos.w === 'number' ? ` · ${pos.w}` : ''
            }${typeof pos.h === 'number' ? `×${pos.h}` : ''}`}
          </div>
        </>
      )}
    </div>
  );
};

// Floating dev panel — shows in edit mode only. Single button to copy current
// state for paste-back to source.
export const MovableDevPanel: React.FC = () => {
  const editMode = useEditMode();
  const [count, setCount] = useState(() => Object.keys(readAll()).length);
  useEffect(() => {
    const onChange = () => setCount(Object.keys(readAll()).length);
    window.addEventListener('movable:change', onChange);
    return () => window.removeEventListener('movable:change', onChange);
  }, []);
  if (!editMode) return null;
  const copy = async () => {
    const json = JSON.stringify(readAll(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      // fallback
      // eslint-disable-next-line no-console
      console.log(json);
    }
  };
  const reset = () => {
    if (!window.confirm('Reset all movable overrides?')) return;
    window.localStorage.removeItem(PORTFOLIO_MOVABLE_KEY);
    window.dispatchEvent(new Event('movable:change'));
  };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: '#0c0a07',
        color: '#faf9f6',
        padding: '10px 14px',
        fontSize: 12,
        fontFamily: 'ui-monospace, Menlo, monospace',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <span style={{ color: '#d62828' }}>EDIT MODE</span>
      <span>{count} overrides</span>
      <button
        onClick={copy}
        style={{
          background: '#d62828',
          color: '#faf9f6',
          border: 'none',
          padding: '4px 10px',
          fontFamily: 'inherit',
          fontSize: 11,
          cursor: 'pointer',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Copy JSON
      </button>
      <button
        onClick={reset}
        style={{
          background: 'transparent',
          color: '#9a978f',
          border: '1px solid #3a3833',
          padding: '4px 10px',
          fontFamily: 'inherit',
          fontSize: 11,
          cursor: 'pointer',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Reset
      </button>
    </div>
  );
};
