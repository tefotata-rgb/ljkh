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
  const baseClasses = "group relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-400/20 to-green-500/20 border-2 border-green-400/50 text-green-400 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/25",
    secondary: "bg-gradient-to-r from-pink-400/20 to-pink-500/20 border-2 border-pink-400/50 text-pink-400 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-400/25"
  };

  const gleamClass = variant === 'primary' ? 'btn-gleam-green' : 'btn-gleam-pink';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <div className={`btn-gleam ${gleamClass}`} aria-hidden="true" />
      <div className="btn-beam" aria-hidden="true" />
      <Icon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      <span className="relative z-10">{children}</span>
      <div className={`absolute -inset-1 rounded-full blur-2xl pointer-events-none opacity-60 ${variant === 'primary' ? 'bg-gradient-to-r from-green-400/40 to-green-500/40' : 'bg-gradient-to-r from-pink-400/40 to-pink-500/40'}`} />
    </button>
  );
};

export default NeonButton;