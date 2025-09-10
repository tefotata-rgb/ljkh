import React from 'react';

interface Logo3DProps {
	className?: string;
}

const Logo3D: React.FC<Logo3DProps> = ({ className = '' }) => {
	return (
		<div className={`relative select-none ${className}`} aria-label="MA logo">
			{/* Main 3D-ish text with inner glow flow */}
			<div className="relative flex items-center justify-center">
				<span className="text-5xl md:text-7xl font-extrabold tracking-tight text-glow-flow text-emboss-blue tilt-sway">
					MA
				</span>

				{/* Moving shine sweep */}
				<span className="absolute inset-x-[-20%] -top-2 h-10 pointer-events-none">
					<span className="block h-full w-1/3 bg-white/20 blur-md rounded-full animate-sweep" />
				</span>
			</div>

			{/* Reflection */}
			<div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 scale-y-[-1] opacity-35 pointer-events-none">
				<span className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-blue-300 via-blue-400 to-blue-200 bg-clip-text text-transparent blur-[1px] mask-fade-b">
					MA
				</span>
			</div>
		</div>
	);
};

export default Logo3D;

