import React from 'react';
import VanillaHologramAbout from '../components/VanillaHologramAbout';
import { Battery, HeartPulse, Sun, CloudRain } from 'lucide-react';

export default function About() {
  const [activeIdx, setActiveIdx] = React.useState<number>(0);
  const [timeStr, setTimeStr] = React.useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [batteryPct] = React.useState<number>(75);
  const [heartBpm] = React.useState<number>(70);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-5xl space-y-10">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-pink-400 to-blue-500 bg-clip-text text-transparent">About Me</h3>

        <div className="relative rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 md:p-6 overflow-hidden">
          <div className="absolute -inset-20 pointer-events-none opacity-60" aria-hidden="true" style={{
            background:
              'radial-gradient(900px 540px at 10% 0%, rgba(59,130,246,0.12), rgba(0,0,0,0)),'+
              'radial-gradient(600px 400px at 90% 100%, rgba(236,72,153,0.10), rgba(0,0,0,0))'
          }} />
          <div className="space-y-6">
            <div className="relative rounded-2xl border border-white/10 bg-black/20 p-3 overflow-hidden">
              {/* HUD overlay */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                  <div className="hud-badge">
                    <Battery className="w-4 h-4 text-sky-300" />
                    <span className="text-xs font-semibold">{batteryPct}%</span>
                  </div>
                  <div className="hud-badge">
                    <HeartPulse className="w-4 h-4 text-rose-300" />
                    <span className="text-xs font-semibold">{heartBpm} bpm</span>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-6">
                  <div className="hud-time select-none">{timeStr}</div>
                </div>
                <div className="absolute right-3 top-3">
                  <div className="hud-card min-w-[112px]">
                    <div className="flex items-center gap-1">
                      <Sun className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs font-bold">25°C</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-white/80">
                      <span className="flex items-center gap-1">Th <CloudRain className="w-3 h-3 text-sky-300" /> 20°C</span>
                      <span>Fr 26°C</span>
                    </div>
                  </div>
                </div>
              </div>

              <VanillaHologramAbout
                panels={[
                  { src: '/1.jpg', alt: 'Intro' },
                  { src: '/3.jpg', alt: 'Thanks' },
                  { src: '/5.jpg', alt: 'Contacts' },
                  { src: '/6.jpg', alt: 'Nile University' },
                ]}
                onSelect={(i) => setActiveIdx(i)}
              />
            </div>
            <div className="space-y-4 md:space-y-5">
              {activeIdx === 0 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">Hello! My name is MOHAMED ATEF, and I am a dedicated software developer with a strong passion for building creative digital solutions. From the very first time I wrote a line of code, I knew that programming was not just a career choice for me, but a lifelong journey of learning, problem-solving, and innovation. Over the years, I’ve developed a deep interest in designing systems that are both efficient and user-friendly. My goal is always to turn ideas into reality through technology, and to create projects that have a real impact.</p></div>
              )}

              {activeIdx === 3 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">I am proud to be a graduate of Nile University, an institution that has played a key role in shaping my academic and professional journey. My years at the university provided me with a strong technical foundation, critical thinking skills, and exposure to real-world projects that challenged me to think outside the box. At Nile University, I not only studied the theoretical aspects of computer science but also applied my knowledge through hands-on experiences, teamwork, and research opportunities. It was here that I learned the value of persistence, collaboration, and innovation in the field of technology.</p></div>
              )}

              {activeIdx === 2 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                  <p className="text-white/90 text-sm md:text-base leading-7">Get in touch with me through any of the following:</p>
                  <div className="flex flex-wrap gap-3">
                    <a className="hud-badge !pointer-events-auto" href="https://www.facebook.com/share/1Cku3ivj8f/" target="_blank" rel="noreferrer">Facebook</a>
                    <a className="hud-badge !pointer-events-auto" href="https://www.linkedin.com/in/mohamed-atef-5b1a82351?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer">LinkedIn</a>
                    <a className="hud-badge !pointer-events-auto" href="https://wa.me/201227866673" target="_blank" rel="noreferrer">WhatsApp: 01227866673</a>
                    <a className="hud-badge !pointer-events-auto" href="tel:+201227866673">Call Me</a>
                  </div>
                </div>
              )}

              {activeIdx === 1 && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5"><p className="text-white/90 text-sm md:text-base leading-7">Thank you so much for visiting my website. Your time and attention mean a lot to me. I hope you enjoyed the experience—feel free to reach out anytime!</p></div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}