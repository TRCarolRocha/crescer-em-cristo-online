import React from 'react';
import hodosLogo from '@/assets/hodos-logo.png';
import { cn } from '@/lib/utils';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <img
      src={hodosLogo}
      alt="Hodos Logo"
      className={cn(
        sizeClasses[size],
        'object-contain drop-shadow-2xl',
        className
      )}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(123, 47, 247, 0.4))',
      }}
    />
  );
};
