import React from 'react';

type Card = { src: string; alt: string; text: string };

interface Props { cards: [Card, Card, Card]; }

export default function FloatingUI3Cards({ cards }: Props) {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { x: nx, y: ny };
    // trigger re-render without heavy state
    setTick((t) => t + 1);
  };
  const onMouseLeave = () => { mouseRef.current = { x: 0, y: 0 }; setTick((t) => t + 1); };
  const [tick, setTick] = React.useState(0);

  const getStyle = (index: number) => {
    const spread = 260;
    const zLift = index === 1 ? 24 : 6;
    const baseX = (index - 1) * spread;
    const tiltX = -4 + mouseRef.current.y * 4;
    const tiltY = mouseRef.current.x * 8;
    const floatY = Math.sin((tick + index * 40) / 40) * 6;
    return {
      transform: `translate3d(${baseX + mouseRef.current.x * (index === 1 ? 16 : 8)}px, ${floatY + mouseRef.current.y * (index === 1 ? 8 : 4)}px, 0px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    } as React.CSSProperties;
  };

  return (
    <div className="relative">
      <div className="holo-bg-blur" aria-hidden="true" />
      <div ref={stageRef} className="holo-stage holo-stage-compact select-none" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
        {cards.map((c, i) => (
          <div key={i} className="holo-panel" style={{ ...getStyle(i), transition: 'transform 260ms ease' }}>
            <div className="holo-panel-glow" />
            <img src={c.src} alt={c.alt} className="holo-img" loading="lazy" />
            <div className="holo-reflection" aria-hidden="true" />
            <div className="holo-border" aria-hidden="true" />
            <div className="absolute left-2 right-2 bottom-2 px-3 py-2 rounded-lg text-[12px] md:text-[13px] text-cyan-100/90 bg-black/30 border border-white/10 backdrop-blur-md">
              {c.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

