import React from 'react';
import HologramGallery from '../components/HologramGallery';

export default function Gallery() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-cyan-400 bg-clip-text text-transparent">Holographic Gallery</h3>
        <p className="text-white/70 mt-2">Futuristic AR-style floating panels in a curved arc.</p>
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 md:p-6 overflow-hidden">
          <HologramGallery />
        </div>
      </div>
    </div>
  );
}

