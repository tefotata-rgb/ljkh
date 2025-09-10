import React, { useEffect, useState } from 'react';
import ThreeBackground from './ThreeBackground';
import Logo3D from './Logo3D';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [nameIndex, setNameIndex] = useState(0);
  const name = 'Mohamed Atef Abdelsattar';

  useEffect(() => {
    let rafId: number;
    let startTs: number | null = null;

    const durationMs = 2600;

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (progress >= 100 && nameIndex >= name.length) {
      const t = setTimeout(() => onLoadingComplete(), 400);
      return () => clearTimeout(t);
    }
  }, [progress, nameIndex, name.length, onLoadingComplete]);

  useEffect(() => {
    if (nameIndex >= name.length) return;
    const timer = setTimeout(() => {
      setNameIndex(prev => prev + 1);
    }, 70);
    return () => clearTimeout(timer);
  }, [nameIndex, name.length]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <ThreeBackground />

      <div className="relative text-center space-y-8">
        <div className="relative w-44 h-44 md:w-56 md:h-56 mx-auto rounded-full pop-in -mt-10 md:-mt-20 lg:-mt-28 xl:-mt-32">
          <div className="blue-bloom" aria-hidden="true" />
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <filter id="neonGlowBlue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Glow stroke behind (thicker, blurred) */}
            <circle
              cx="50" cy="50" r="44" fill="none" strokeWidth="10"
              strokeLinejoin="round" strokeLinecap="round"
              stroke="url(#gradBlue)" opacity="0.45"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${(1 - progress / 100) * 2 * Math.PI * 44}`}
              filter="url(#neonGlowBlue)"
            />
            {/* Crisp main stroke (thinner) */}
            <circle
              cx="50" cy="50" r="44" fill="none" strokeWidth="4"
              strokeLinejoin="round" strokeLinecap="round"
              stroke="url(#gradBlue)"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${(1 - progress / 100) * 2 * Math.PI * 44}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center neon-3d-blue">
            <Logo3D />
          </div>
        </div>

        {/* Centered Progress Only (now hidden; moved to bottom bar) */}
        <div className="hidden" />
      </div>

      {/* Bottom-fixed typed name with progress and dots */}
      <div className="absolute inset-x-0 bottom-6 md:bottom-8 lg:bottom-10 z-20">
        <div className="text-center">
          <span className="text-2xl md:text-3xl font-semibold tracking-wide bg-gradient-to-r from-blue-300 via-blue-400 to-blue-200 bg-clip-text text-transparent">
            {name.slice(0, nameIndex)}
          </span>
          <span className="typing-caret">|</span>
        </div>
        <div className="mt-3 space-y-2 flex flex-col items-center">
          <div className="w-64 progress-track-neon mx-auto">
            <div 
              className="progress-fill-neon"
              style={{ width: `${progress}%` }}
            />
            <div className="progress-sheen" />
          </div>
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;