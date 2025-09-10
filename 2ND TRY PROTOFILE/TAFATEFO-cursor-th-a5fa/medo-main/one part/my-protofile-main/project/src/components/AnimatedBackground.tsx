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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNodes = () => {
      if (prefersReducedMotion) {
        nodesRef.current = [];
        return;
      }

      // Denser effect like original mesh
      const baseCount = Math.min(260, Math.floor((canvas.width * canvas.height) / 7000));
      const maxForSmallScreens = window.innerWidth < 768 ? 120 : 260;
      const nodeCount = Math.min(maxForSmallScreens, baseCount);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        // Faster movement like original
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 5.0,
          vy: (Math.random() - 0.5) * 5.0,
          connections: [],
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
      // Original denser mesh
      const maxDistance = 260;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          const distance = Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.6;
            const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
            // Blue neon-only palette
            gradient.addColorStop(0, `rgba(147, 197, 253, ${opacity})`); // blue-300
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${opacity})`); // blue-500
            gradient.addColorStop(1, `rgba(29, 78, 216, ${opacity})`); // blue-700
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
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
        gradient.addColorStop(0, 'rgba(147, 197, 253, 1)');   // blue-300 center
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.85)'); // blue-500 mid
        gradient.addColorStop(1, 'rgba(30, 64, 175, 0.25)');    // blue-800 outer

        ctx.fillStyle = gradient;
        const size = 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = '#3b82f6'; // blue-500
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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