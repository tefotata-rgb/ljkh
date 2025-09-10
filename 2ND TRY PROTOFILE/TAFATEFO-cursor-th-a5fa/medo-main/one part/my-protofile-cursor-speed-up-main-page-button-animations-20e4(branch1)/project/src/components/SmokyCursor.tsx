import React, { useEffect, useRef } from 'react';

type SmokeParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeMs: number;
  maxLifeMs: number;
  hue: number;
  size: number;
  alpha: number;
};

type SmokeEmitter = {
  x: number;
  y: number;
  baseHue: number;
  speed: number;
  angle: number;
  swirl: number;
  lastEmitMs: number;
  emitIntervalMs: number;
};

const SmokyCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);
  const emittersRef = useRef<SmokeEmitter[]>([]);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setSize();
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    // Initialize autonomous smoke emitters
    const createEmitters = () => {
      const { clientWidth, clientHeight } = canvas;
      const numEmitters = Math.max(3, Math.min(6, Math.floor(clientWidth / 400)));
      const newEmitters: SmokeEmitter[] = [];
      for (let i = 0; i < numEmitters; i++) {
        newEmitters.push({
          x: (clientWidth / (numEmitters + 1)) * (i + 1),
          y: clientHeight * (0.35 + 0.3 * Math.random()),
          baseHue: 160 + Math.random() * 200,
          speed: 0.25 + Math.random() * 0.35,
          angle: Math.random() * Math.PI * 2,
          swirl: 0.002 + Math.random() * 0.004,
          lastEmitMs: 0,
          emitIntervalMs: 28 + Math.random() * 22,
        });
      }
      emittersRef.current = newEmitters;
    };

    createEmitters();

    const now = () => performance.now();

    const emitParticlesFromEmitters = (t: number) => {
      const particles = particlesRef.current;
      const emitters = emittersRef.current;
      for (let i = 0; i < emitters.length; i++) {
        const emitter = emitters[i];
        if (t - emitter.lastEmitMs < emitter.emitIntervalMs) continue;
        emitter.lastEmitMs = t;

        const burstCount = 2 + Math.floor(Math.random() * 3);
        for (let b = 0; b < burstCount; b++) {
          const jitterAngle = emitter.angle + (Math.random() - 0.5) * 0.8;
          const speed = 0.3 + Math.random() * 0.7;
          const hue = emitter.baseHue + (Math.random() - 0.5) * 40;
          const maxLifeMs = 1100 + Math.random() * 1200;
          const size = 10 + Math.random() * 18;
          particles.push({
            x: emitter.x + (Math.random() - 0.5) * 18,
            y: emitter.y + (Math.random() - 0.5) * 18,
            vx: Math.cos(jitterAngle) * speed * 0.8,
            vy: Math.sin(jitterAngle) * speed * 0.6 - 0.1,
            lifeMs: 0,
            maxLifeMs,
            hue,
            size,
            alpha: 0.45 + Math.random() * 0.4,
          });
        }
      }
    };

    const step = () => {
      const t = now();

      // Update emitter motion (smooth wandering)
      const emitters = emittersRef.current;
      const { clientWidth, clientHeight } = canvas;
      for (let i = 0; i < emitters.length; i++) {
        const e = emitters[i];
        // gentle angle drift creates a smoky wave motion
        e.angle += e.swirl + Math.sin((t + i * 700) * 0.0006) * 0.002;
        e.x += Math.cos(e.angle) * e.speed;
        e.y += Math.sin(e.angle * 0.8) * e.speed * 0.6 - 0.05; // slight upwards bias
        // wrap softly at edges
        if (e.x < -40) e.x = clientWidth + 40;
        if (e.x > clientWidth + 40) e.x = -40;
        if (e.y < clientHeight * 0.15) e.y = clientHeight * 0.15 + 4;
        if (e.y > clientHeight * 0.85) e.y = clientHeight * 0.85 - 4;
      }

      emitParticlesFromEmitters(t);

      ctx.globalCompositeOperation = 'source-over';
      // Very low alpha to create smooth trails without harsh clearing
      ctx.fillStyle = 'rgba(17,24,39,0.05)';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      ctx.globalCompositeOperation = 'lighter';
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.lifeMs += 16;
        const lifeRatio = Math.min(1, p.lifeMs / p.maxLifeMs);
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 - 0.004;

        const fade = 1 - lifeRatio;
        const alpha = Math.max(0, p.alpha * (0.85 * fade + 0.15 * Math.sin((p.lifeMs + p.hue) * 0.01)));
        const size = p.size * (0.55 + 0.45 * fade);

        ctx.filter = 'blur(14px)';
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        gradient.addColorStop(0, `hsla(${Math.round(p.hue)}, 85%, 64%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${Math.round(p.hue)}, 85%, 64%, 0)`);
        ctx.fillStyle = gradient as unknown as string;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';

        if (lifeRatio >= 1) {
          particles.splice(i, 1);
        }
      }

      animationIdRef.current = requestAnimationFrame(step);
    };

    animationIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default SmokyCursor;

