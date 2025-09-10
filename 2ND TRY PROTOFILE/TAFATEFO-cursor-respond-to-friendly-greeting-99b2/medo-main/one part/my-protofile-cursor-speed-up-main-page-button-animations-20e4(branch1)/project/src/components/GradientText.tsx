import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x" aria-hidden="true">
        {children}
      </div>
      <div className="bg-gradient-to-r from-green-400 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x-delayed">
        {children}
      </div>
    </div>
  );
};

export default GradientText;