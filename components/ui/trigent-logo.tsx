'use client';

interface TrigentLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function TrigentLogo({ size = 'md', className = '' }: TrigentLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-2xl`}>
      <img 
        src="/Trigent AI Logo.svg" 
        alt="TrigentAI Logo"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to gradient logo if SVG fails
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextSibling) {
            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
      {/* Fallback gradient logo */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl rounded-2xl"
        style={{ display: 'none' }}
      >
        T
      </div>
    </div>
  );
}
