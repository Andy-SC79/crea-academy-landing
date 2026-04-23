import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  enableGlow?: boolean;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className,
  maxRotation = 10,
  enableGlow = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-1 to 1 normalized)
    const rotateX = ((y - centerY) / centerY) * -1; // Invert Y for natural feel
    const rotateY = (x - centerX) / centerX;

    setRotation({
      x: rotateX * maxRotation,
      y: rotateY * maxRotation
    });

    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
        className="perspective-[1000px] w-full h-full"
    >
        <div
            ref={cardRef}
            className={cn(
                "relative w-full h-full transition-all duration-200 ease-out preserve-3d will-change-transform",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
        >
            {/* Glow Effect */}
            {enableGlow && isHovering && (
                <div 
                    className="absolute inset-0 z-10 pointer-events-none rounded-2xl mix-blend-overlay transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.2) 0%, transparent 80%)`
                    }}
                />
            )}
            
            {/* Content */}
            {children}
            
            {/* Shine/Reflection */}
            {isHovering && (
                 <div 
                    className="absolute inset-0 z-20 pointer-events-none rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30"
                 />
            )}
        </div>
        
        <style>{`
            .preserve-3d { transform-style: preserve-3d; }
        `}</style>
    </div>
  );
};

export default ThreeDCard;
