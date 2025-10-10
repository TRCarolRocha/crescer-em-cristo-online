import React, { ReactNode } from 'react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { UpgradePrompt } from './UpgradePrompt';

interface AccessGateProps {
  requiredAccess: keyof ReturnType<typeof useSubscriptionAccess>['access'];
  children: ReactNode;
  fallback?: ReactNode;
}

export const AccessGate: React.FC<AccessGateProps> = ({ 
  requiredAccess, 
  children, 
  fallback 
}) => {
  const { access, isLoading } = useSubscriptionAccess();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasAccess = access[requiredAccess];

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">Recurso Premium</h2>
            <p className="text-muted-foreground">
              Este recurso está disponível apenas para assinantes.
            </p>
            <button 
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ver Planos
            </button>
          </div>
        </div>
        <UpgradePrompt 
          open={showUpgrade} 
          onOpenChange={setShowUpgrade}
          currentPlan={access.planType}
        />
      </>
    );
  }

  return <>{children}</>;
};
