import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NeonButtonProps {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  icon: Icon, 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}) => {
  const baseClasses = "group relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-75 transform hover:scale-110 active:scale-90 flex items-center gap-3 overflow-hidden perspective-1000";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-400/20 to-blue-500/20 border-2 border-green-400/50 text-green-400 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/25",
    secondary: "bg-gradient-to-r from-pink-400/20 to-purple-500/20 border-2 border-pink-400/50 text-pink-400 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-400/25"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {/* 3D floating layers */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className={`h-full w-full animate-float-3d ${variant === 'primary' ? 'bg-gradient-to-r from-green-400/30 via-green-300/20 to-transparent' : 'bg-gradient-to-r from-pink-400/30 via-pink-300/20 to-transparent'}`} />
      </div>

      {/* 3D rotating cube effect */}
      <div className={`absolute inset-0 rounded-full animate-cube-3d ${variant === 'primary' ? 'bg-gradient-to-r from-green-400/20 to-blue-400/20' : 'bg-gradient-to-r from-pink-400/20 to-purple-400/20'}`} />

      {/* 3D tilt effect on hover */}
      <div className="absolute inset-0 rounded-full group-hover:animate-tilt-3d transition-all duration-75" />

      {/* 3D floating particles */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-particle-3d ${variant === 'primary' ? 'bg-green-400' : 'bg-pink-400'}`} />
      <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full animate-particle-3d ${variant === 'primary' ? 'bg-blue-400' : 'bg-purple-400'}`} style={{ animationDelay: '0.2s' }} />
      <div className={`absolute top-1/2 left-2 w-1.5 h-1.5 rounded-full animate-particle-3d ${variant === 'primary' ? 'bg-cyan-400' : 'bg-yellow-400'}`} style={{ animationDelay: '0.4s' }} />

      <Icon className="w-6 h-6 group-hover:rotate-180 group-hover:scale-125 transition-all duration-75" />
      <span className="relative z-10 group-hover:scale-110 transition-transform duration-75">{children}</span>
      
      {/* 3D glow with depth */}
      <div className={`absolute -inset-3 rounded-full blur-2xl pointer-events-none opacity-50 animate-glow-3d ${variant === 'primary' ? 'bg-gradient-to-r from-green-400/80 to-blue-500/80' : 'bg-gradient-to-r from-pink-400/80 to-purple-500/80'}`} />
      
      {/* 3D shadow effect */}
      <div className={`absolute -inset-1 rounded-full bg-black/20 blur-sm group-hover:animate-shadow-3d ${variant === 'primary' ? 'shadow-green-400/50' : 'shadow-pink-400/50'}`} />
      
      {/* 3D depth lines */}
      <div className={`absolute inset-0 rounded-full border-2 border-transparent group-hover:animate-depth-3d ${variant === 'primary' ? 'border-green-400/30' : 'border-pink-400/30'}`} />
      
      {/* 3D corner highlights */}
      <div className={`absolute top-0 left-0 w-3 h-3 rounded-full animate-corner-3d ${variant === 'primary' ? 'bg-green-400/60' : 'bg-pink-400/60'}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 rounded-full animate-corner-3d ${variant === 'primary' ? 'bg-blue-400/60' : 'bg-purple-400/60'}`} style={{ animationDelay: '0.1s' }} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full animate-corner-3d ${variant === 'primary' ? 'bg-cyan-400/60' : 'bg-yellow-400/60'}`} style={{ animationDelay: '0.2s' }} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full animate-corner-3d ${variant === 'primary' ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`} style={{ animationDelay: '0.3s' }} />
    </button>
  );
};

export default NeonButton;