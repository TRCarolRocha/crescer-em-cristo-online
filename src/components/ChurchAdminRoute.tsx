import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface ChurchAdminRouteProps {
  children: React.ReactNode;
}

const ChurchAdminRoute: React.FC<ChurchAdminRouteProps> = ({ children }) => {
  const { isSuperAdmin, isChurchAdmin, loading } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b2ff7]"></div>
      </div>
    );
  }

  if (!isSuperAdmin && !isChurchAdmin) {
    return <Navigate to="/igreja/monte-hebrom" replace />;
  }

  return <>{children}</>;
};

export default ChurchAdminRoute;
