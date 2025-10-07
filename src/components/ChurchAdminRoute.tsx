import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';

interface ChurchAdminRouteProps {
  children: React.ReactNode;
}

const ChurchAdminRoute: React.FC<ChurchAdminRouteProps> = ({ children }) => {
  const { churchSlug } = useParams();
  const { isSuperAdmin, canManageChurch, loading: permissionsLoading } = usePermissions();
  const [churchId, setChurchId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (permissionsLoading) return;

      // Super admin tem acesso a tudo
      if (isSuperAdmin) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Se tem churchSlug, verificar permissão específica
      if (churchSlug) {
        const { data: church, error } = await supabase
          .from('churches')
          .select('id')
          .eq('slug', churchSlug)
          .single();

        if (error || !church) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setChurchId(church.id);
        const canManage = await canManageChurch(church.id);
        setHasAccess(canManage);
      } else {
        setHasAccess(false);
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [churchSlug, isSuperAdmin, canManageChurch, permissionsLoading]);

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b2ff7]"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/igreja/monte-hebrom" replace />;
  }

  return <>{children}</>;
};

export default ChurchAdminRoute;
