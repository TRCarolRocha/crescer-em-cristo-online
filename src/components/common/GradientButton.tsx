import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Button
      className={cn(
        'bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]',
        'hover:from-[#6920d9] hover:to-[#d9068c]',
        'text-white font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
