import React from 'react';
import VanillaHologramAbout from '../components/VanillaHologramAbout';

export default function About() {
  const [activeIdx, setActiveIdx] = React.useState<number>(0);
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-5xl space-y-10">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-pink-400 to-blue-500 bg-clip-text text-transparent">About Me</h3>

        <div className="relative rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 md:p-6 overflow-visible">
          <div className="absolute -inset-20 pointer-events-none opacity-60" aria-hidden="true" style={{
            background:
              'radial-gradient(900px 540px at 10% 0%, rgba(59,130,246,0.12), rgba(0,0,0,0)),'+
              'radial-gradient(600px 400px at 90% 100%, rgba(236,72,153,0.10), rgba(0,0,0,0))'
          }} />
          <div className="grid grid-cols-1 gap-6 md:gap-10 items-center justify-items-center">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:p-6">
              <VanillaHologramAbout
                panels={[
                  { src: '/1.jpg', alt: 'Mohamed Atef portrait' },
                  { src: '/2.jpg', alt: 'Collaboration and connection' },
                  { src: '/6.jpg', alt: 'Nile University highlight' },
                ]}
                onSelect={(i) => setActiveIdx(i)}
              />
            </div>
            <div className="space-y-4 md:space-y-5">
              {activeIdx === 0 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">Hello! My name is Mohamed Atef, and I am a dedicated software developer with a strong passion for building creative digital solutions. From the very first time I wrote a line of code, I knew that programming was not just a career choice for me, but a lifelong journey of learning, problem-solving, and innovation.</p></div>
              )}
              {activeIdx === 1 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">I believe in collaboration and building meaningful connections. If you would like to work together, discuss ideas, or simply connect, I’m always open to conversations that create impact.</p></div>
              )}
              {activeIdx === 2 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">I am proud to be a graduate of Nile University, which shaped my academic and professional journey with a strong technical foundation, critical thinking, and real-world projects.</p></div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}