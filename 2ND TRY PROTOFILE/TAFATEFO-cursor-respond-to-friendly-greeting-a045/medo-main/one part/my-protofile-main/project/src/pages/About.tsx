import React from 'react';
import HologramGallery from '../components/HologramGallery';

export default function About() {
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
          <HologramGallery />
        </div>

        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-green-400/30 via-pink-400/30 to-blue-500/30" aria-hidden="true" />
          <div className="relative w-full h-[340px] md:h-[420px] bg-black/30 flex items-center justify-center">
            <img src="/1.jpg" alt="Mohamed Atef portrait" className="max-h-full w-auto object-contain" />
          </div>
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              Hello! My name is Mohamed Atef, and I am a dedicated software developer with a strong passion for building creative digital solutions. From the very first time I wrote a line of code, I knew that programming was not just a career choice for me, but a lifelong journey of learning, problem-solving, and innovation. Over the years, I’ve developed a deep interest in designing systems that are both efficient and user-friendly. My goal is always to turn ideas into reality through technology, and to create projects that have a real impact.
            </p>
          </div>
        </div>

        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-blue-400/30 via-pink-400/30 to-green-500/30" aria-hidden="true" />
          <img src="/6.jpg" alt="Nile University highlight" className="w-full max-h-[480px] object-cover" />
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              I am proud to be a graduate of Nile University, an institution that has played a key role in shaping my academic and professional journey. My years at the university provided me with a strong technical foundation, critical thinking skills, and exposure to real-world projects that challenged me to think outside the box. At Nile University, I not only studied the theoretical aspects of computer science but also applied my knowledge through hands-on experiences, teamwork, and research opportunities. It was here that I learned the value of persistence, collaboration, and innovation in the field of technology.
            </p>
          </div>
        </div>

        <div className="relative group rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          <span className="absolute -inset-6 rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-pink-400/30 via-blue-400/30 to-green-500/30" aria-hidden="true" />
          <div className="relative w-full h-[340px] md:h-[420px] bg-black/30 flex items-center justify-center">
            <img src="/2.jpg" alt="Collaboration and connection" className="max-h-full w-auto object-contain" />
          </div>
          <div className="relative p-6">
            <p className="text-white/95 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium">
              Thank you for visiting my page and taking the time to get to know more about me. I am always open to new opportunities, collaborations, and meaningful conversations in the world of technology and beyond. If you would like to work together, discuss ideas, or simply connect, please feel free to reach out. I believe that great things happen when people share knowledge and collaborate on building something bigger than themselves. Let’s create something impactful together!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

