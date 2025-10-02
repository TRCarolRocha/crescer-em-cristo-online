import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  showBackButton = true, 
  backTo = '/',
  className = ''
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={`mb-8 ${className}`}>
      {showBackButton && (
        <Button
          variant="outline"
          onClick={() => navigate(backTo)}
          className="mb-4 flex items-center gap-2 hover:bg-accent transition-colors"
        >
          {backTo === '/' ? (
            <>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar à Home</span>
              <span className="sm:hidden">Home</span>
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </>
          )}
        </Button>
      )}
      
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
