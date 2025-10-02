import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export const PageContainer = ({ 
  children, 
  className = '', 
  maxWidth = '6xl' 
}: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5">
      <div className={`container mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}>
        {children}
      </div>
    </div>
  );
};
