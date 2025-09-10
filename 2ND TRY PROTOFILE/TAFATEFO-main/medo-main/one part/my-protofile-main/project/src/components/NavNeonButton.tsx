import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

type Variant = 'green' | 'pink' | 'blue';

interface NavNeonButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  lite?: boolean;
  noBeam?: boolean;
}

const NavNeonButton: React.FC<NavNeonButtonProps> = ({ to, children, variant = 'blue', className = '', onClick, lite = false, noBeam = false }) => {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // Default blue; turn green on hover/focus/active
  const shouldGreen = isHover || isActive || isFocus;
  const effective: Variant = shouldGreen ? 'green' : 'blue';

  if (lite) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className={`px-4 py-2 rounded-full border border-white/15 bg-black/30 text-white/85 hover:text-white transition ${className}`}
      >
        {children}
      </NavLink>
    );
  }

  const baseClasses = "group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2";
  const variantClasses: Record<Variant, string> = {
    green: "bg-gradient-to-r from-green-400/20 to-green-500/20 border-2 border-green-400/50 text-green-400",
    pink: "bg-gradient-to-r from-pink-400/20 to-pink-500/20 border-2 border-pink-400/50 text-pink-400",
    blue: "bg-gradient-to-r from-blue-400/20 to-blue-500/20 border-2 border-blue-400/50 text-blue-400 hover:from-green-400/20 hover:to-green-500/20 hover:border-green-400/50 hover:text-green-400 focus:from-green-400/20 focus:to-green-500/20 focus:border-green-400/50 focus:text-green-400",
  } as const;

  const baseGleamClass = effective === 'green' ? 'btn-gleam-green' : effective === 'pink' ? 'btn-gleam-pink' : 'btn-gleam-blue';
  const baseGlowClass = effective === 'green'
    ? 'bg-gradient-to-r from-green-400/50 to-green-500/50'
    : effective === 'pink'
    ? 'bg-gradient-to-r from-pink-400/50 to-pink-500/50'
    : 'bg-gradient-to-r from-blue-400/50 to-blue-500/50';

  return (
    <NavLink
      to={to}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => { setIsHover(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      className={`${baseClasses} ${variantClasses[effective]} ${className}`}
    >
      {/* base gleam + beam (blue when shouldBlue) */}
      <span className={`btn-gleam ${baseGleamClass}`} aria-hidden="true" />
      {!noBeam && <span className="btn-beam" aria-hidden="true" />}

      {/* moving sweep matching effective color */}
      {!noBeam && (
        <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" aria-hidden="true">
          <span className={`h-full w-1/3 translate-x-[-150%] animate-sweep ${shouldGreen ? 'opacity-70' : 'opacity-0'} bg-gradient-to-r from-green-400/50 via-green-300/40 to-transparent transition-opacity duration-150`} />
        </span>
      )}

      <span className={`relative z-10 ${shouldGreen ? 'text-green-400' : 'text-blue-400'}`}>{children}</span>

      {/* outer glow: effective color */}
      <span className={`absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 animate-breathe ${baseGlowClass}`} aria-hidden="true" />
    </NavLink>
  );
};

export default NavNeonButton;