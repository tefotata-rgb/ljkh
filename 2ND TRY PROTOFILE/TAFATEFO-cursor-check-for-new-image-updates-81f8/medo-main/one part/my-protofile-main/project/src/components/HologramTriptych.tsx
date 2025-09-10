import React from 'react';

type Panel = {
  src: string;
  alt: string;
  text: string;
};

interface Props {
  panels: [Panel, Panel, Panel];
}

export default function HologramTriptych({ panels }: Props) {
  const [active, setActive] = React.useState(1);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef<{ dragging: boolean; startX: number; lastX: number }>({ dragging: false, startX: 0, lastX: 0 });

  React.useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!stageRef.current) return;
      e.preventDefault();
      setActive((a) => (e.deltaY > 0 ? Math.min(2, a + 1) : Math.max(0, a - 1)));
    };
    const stage = stageRef.current;
    stage?.addEventListener('wheel', onWheel, { passive: false });
    return () => stage?.removeEventListener('wheel', onWheel as any);
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { x: nx, y: ny };
    // trigger re-render via state that doesn't cause heavy updates: use active setter noop
    setActive((a) => a);
  };

  const onMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 };
    setActive((a) => a);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = { dragging: true, startX: e.clientX, lastX: e.clientX };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current.dragging) return;
    const dx = e.clientX - draggingRef.current.lastX;
    draggingRef.current.lastX = e.clientX;
    if (Math.abs(dx) > 12) {
      setActive((a) => (dx < 0 ? Math.min(2, a + 1) : Math.max(0, a - 1)));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = { dragging: false, startX: 0, lastX: 0 };
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const getTransformFor = (index: number) => {
    // center the active one, others to sides; add mouse tilt
    const side = index - active; // -1, 0, 1 etc
    const baseX = side * 240;
    const baseZ = side === 0 ? 0 : -120;
    const baseRotY = side * 12;
    const tiltX = -8 + mouseRef.current.y * 6;
    const tiltY = baseRotY + mouseRef.current.x * 8 * (side === 0 ? 1 : 0.6);
    return `translate3d(${baseX}px, ${-Math.abs(side) * 6}px, ${baseZ}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  };

  return (
    <div className="relative">
      <div className="holo-bg-blur" aria-hidden="true" />
      <div
        ref={stageRef}
        className="holo-stage holo-stage-compact select-none"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {panels.map((p, i) => (
          <div
            key={i}
            className="holo-panel"
            style={{ transform: getTransformFor(i), transition: 'transform 360ms cubic-bezier(.2,.8,.2,1)', animationDelay: `${i * 0.12}s` }}
            onClick={() => setActive(i)}
          >
            <div className="holo-panel-glow" />
            <img src={p.src} alt={p.alt} className="holo-img" loading="lazy" />
            <div className="holo-reflection" aria-hidden="true" />
            <div className="holo-border" aria-hidden="true" />
            <div className="absolute left-2 right-2 bottom-2 px-3 py-2 rounded-lg text-[12px] md:text-[13px] text-cyan-100/90 bg-black/30 border border-white/10 backdrop-blur-md">
              {p.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {panels.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Show panel ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full ${active === i ? 'bg-cyan-400' : 'bg-white/30'}`}
          />)
        )}
      </div>
    </div>
  );
}

