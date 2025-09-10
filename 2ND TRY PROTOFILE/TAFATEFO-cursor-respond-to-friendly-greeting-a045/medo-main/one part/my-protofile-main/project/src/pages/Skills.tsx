import React from 'react';

export default function Skills() {
  const skills: { name: string; icon?: string }[] = [
    { name: 'HTML', icon: 'devicon-html5-plain' },
    { name: 'CSS', icon: 'devicon-css3-plain' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain' },
    { name: 'Python', icon: 'devicon-python-plain' },
    { name: 'Java', icon: 'devicon-java-plain' },
    { name: 'C', icon: 'devicon-c-plain' },
    { name: 'C++', icon: 'devicon-cplusplus-plain' },
    { name: 'C#', icon: 'devicon-csharp-plain' },
    { name: 'PHP', icon: 'devicon-php-plain' },
    { name: 'Ruby', icon: 'devicon-ruby-plain' },
    { name: 'Swift', icon: 'devicon-swift-plain' },
    { name: 'Kotlin', icon: 'devicon-kotlin-plain' },
    { name: 'Go', icon: 'devicon-go-plain' },
    { name: 'Rust', icon: 'devicon-rust-plain' },
    { name: 'R', icon: 'devicon-r-plain' },
    { name: 'Dart', icon: 'devicon-dart-plain' },
    { name: 'SQL', icon: 'devicon-mysql-plain' },
    { name: 'Scala', icon: 'devicon-scala-plain' },
    { name: 'MATLAB', icon: 'devicon-matlab-plain' },
  ];
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" style={{background:
        'radial-gradient(900px 540px at 10% 0%, rgba(59,130,246,0.12), rgba(0,0,0,0)),'+
        'radial-gradient(600px 400px at 90% 100%, rgba(236,72,153,0.10), rgba(0,0,0,0)),'+
        'radial-gradient(700px 420px at 50% 50%, rgba(16,185,129,0.08), rgba(0,0,0,0))'}} />
      <div className="mx-auto max-w-7xl relative">
        <div className="mb-10">
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neon-strong-blue">Skills</h3>
          <p className="mt-3 text-white/90 text-[1.05rem] md:text-lg leading-8 md:leading-9 tracking-wide font-medium text-neon-strong-blue">
            Passionate full‑stack developer crafting performant, delightful user experiences and reliable backends.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
          {skills.map((s) => (
            <div key={s.name} className="tilt-wrap">
              <div className="relative flex flex-col items-center justify-center text-center tilt-card">
                <div className="shine-wrap relative h-16 w-16 md:h-20 md:w-20 rounded-full circle-neon flex items-center justify-center">
                  <div className="shine" aria-hidden="true" />
                  {s.icon ? (
                    <i className={`${s.icon} colored text-3xl md:text-4xl icon-neon`} aria-hidden="true" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                  )}
                </div>
                <span className="mt-2 text-xs md:text-sm font-semibold text-neon-blue">{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

