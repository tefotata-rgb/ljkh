import React from 'react';

type Panel = { src: string; alt: string; text: string };
interface Props {
  panels: [Panel, Panel, Panel];
  captionSide?: 'left' | 'right';
}

export default function HologramSemiCircle({ panels, captionSide = 'right' }: Props) {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { x: nx, y: ny };
    setTick((t) => t + 1);
  };
  const onMouseLeave = () => { mouseRef.current = { x: 0, y: 0 }; setTick((t) => t + 1); };
  const [tick, setTick] = React.useState(0);

  const getTransformFor = (index: number) => {
    const step = 0.55; // radians between panels (~31.5deg)
    const radius = 360; // px
    const centerZ = -140; // push a bit into screen
    const angle = (index - 1) * step; // -step, 0, step
    const x = Math.sin(angle) * radius + mouseRef.current.x * 14 * (index === 1 ? 1 : 0.6);
    const z = Math.cos(angle) * radius + centerZ;
    const y = Math.sin((tick + index * 40) / 60) * 8 + mouseRef.current.y * 8 * (index === 1 ? 1 : 0.6);
    const rotY = (angle * 180) / Math.PI * 0.9 + mouseRef.current.x * 6 * (index === 1 ? 1 : 0.6);
    const rotX = -8 + mouseRef.current.y * 6;
    return `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const captions = (
    <div className="space-y-4 md:space-y-5">
      {panels.map((p, i) => (
        <div
          key={i}
          className={"p-4 rounded-xl border " + (hoverIdx === i ? 'border-cyan-300/70 bg-white/10' : 'border-white/10 bg-white/5')}
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
          role="button"
          tabIndex={0}
          onFocus={() => setHoverIdx(i)}
          onBlur={() => setHoverIdx(null)}
        >
          <p className="text-white/90 text-sm md:text-base leading-7">{p.text}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
      {captionSide === 'left' && captions}

      <div className="relative">
        <div className="holo-bg-blur" aria-hidden="true" />
        <div
          ref={stageRef}
          className="holo-stage select-none"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {panels.map((p, i) => (
            <div
              key={i}
              className="holo-panel"
              style={{ transform: getTransformFor(i), transition: 'transform 380ms cubic-bezier(.2,.8,.2,1)', animationDelay: `${i * 0.12}s` }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              aria-label={p.alt}
            >
              <div className="holo-panel-glow" />
              <img src={p.src} alt={p.alt} className="holo-img" loading="lazy" />
              <div className="holo-reflection" aria-hidden="true" />
              <div className="holo-border" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {captionSide === 'right' && captions}
    </div>
  );
}

