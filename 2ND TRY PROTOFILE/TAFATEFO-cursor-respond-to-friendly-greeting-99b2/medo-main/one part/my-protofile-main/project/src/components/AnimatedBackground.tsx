import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const deviceMem = (navigator as any).deviceMemory || 4;
    const isLowPower = deviceMem <= 3;
    const isMobileMode = isSmallScreen || isLowPower;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileMode ? 1 : 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createNodes = () => {
      if (prefersReducedMotion) {
        nodesRef.current = [];
        return;
      }

      // Mobile-friendly: far fewer nodes, lighter motion
      const baseCount = Math.min(220, Math.floor((canvas.width * canvas.height) / 9000));
      const maxForSmallScreens = isMobileMode ? 28 : 160;
      const nodeCount = Math.min(maxForSmallScreens, baseCount);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Slower movement on mobile to reduce CPU/GPU
          vx: (Math.random() - 0.5) * (isMobileMode ? 1.4 : 3.2),
          vy: (Math.random() - 0.5) * (isMobileMode ? 1.4 : 3.2),
          connections: []
        });
      }
    };

    const updateNodes = () => {
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });
    };

    const drawConnections = () => {
      // Skip heavy O(n^2) lines on mobile mode for better performance
      if (isMobileMode) return;
      const maxDistance = 220;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.5;
            ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      nodesRef.current.forEach(node => {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 1)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.3)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    let last = 0;
    const animate = (ts = 0) => {
      // 30fps throttle on mobile
      if (isMobileMode) {
        const dt = ts - last;
        if (dt < 33) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        last = ts;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!prefersReducedMotion) {
        updateNodes();
        drawConnections();
        drawNodes();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createNodes();
    if (!prefersReducedMotion) {
      animate();
    }

    const handleResize = () => {
      resizeCanvas();
      createNodes();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      } else if (document.visibilityState === 'visible') {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      role="presentation"
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedBackground;