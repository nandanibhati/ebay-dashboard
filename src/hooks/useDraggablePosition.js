import { useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD = 6; // px of movement before a click counts as a drag

function clamp(pos, width, height) {
  const margin = 12;
  const maxLeft = window.innerWidth - width - margin;
  const maxTop = window.innerHeight - height - margin;
  return {
    left: Math.min(Math.max(pos.left, margin), Math.max(maxLeft, margin)),
    top: Math.min(Math.max(pos.top, margin), Math.max(maxTop, margin)),
  };
}

// Drag-anywhere-on-screen position, persisted per storageKey, with a
// distinction between "click" (fires onClick) and "drag" (just moves it).
export default function useDraggablePosition(storageKey, defaultPosition, size) {
  const [position, setPosition] = useState(null);
  const dragState = useRef({ dragging: false, moved: false, startX: 0, startY: 0, originLeft: 0, originTop: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPosition(clamp(JSON.parse(saved), size.width, size.height));
        return;
      } catch {}
    }
    setPosition(clamp(defaultPosition(), size.width, size.height));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setPosition((p) => (p ? clamp(p, size.width, size.height) : p));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  const handlePointerDown = (e) => {
    if (!position) return;
    dragState.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: position.left,
      originTop: position.top,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragState.current.moved = true;
    }
    if (dragState.current.moved) {
      setPosition(
        clamp(
          { left: dragState.current.originLeft + dx, top: dragState.current.originTop + dy },
          size.width,
          size.height
        )
      );
    }
  };

  const handlePointerUp = (onClick) => {
    if (!dragState.current.dragging) return;
    const wasDrag = dragState.current.moved;
    dragState.current.dragging = false;
    dragState.current.moved = false;

    if (wasDrag) {
      setPosition((p) => {
        localStorage.setItem(storageKey, JSON.stringify(p));
        return p;
      });
    } else {
      onClick?.();
    }
  };

  return { position, handlePointerDown, handlePointerMove, handlePointerUp };
}
