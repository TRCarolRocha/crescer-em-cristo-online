import React from 'react';
import hodosLogoGradient from '@/assets/hodos-logo-gradient.png';
import { cn } from '@/lib/utils';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  return (
    <img
      src={hodosLogoGradient}
      alt="Hodos Logo"
      className={cn(
        sizeClasses[size],
        'object-contain',
        className
      )}
      style={{
        filter: 'drop-shadow(0 0 15px rgba(123, 47, 247, 0.3))',
      }}
    />
  );
};
