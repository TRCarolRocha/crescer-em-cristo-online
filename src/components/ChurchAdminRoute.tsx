import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
          .maybeSingle();

        if (error || !church) {
          console.warn('Igreja não encontrada para o slug:', churchSlug, error?.message);
          setHasAccess(false);
          setLoading(false);
          toast({
            title: 'Acesso negado',
            description: 'Igreja não encontrada ou você não tem permissão.',
            variant: 'destructive'
          });
          return;
        }

        setChurchId(church.id);
        const canManage = await canManageChurch(church.id);
        setHasAccess(canManage);
        if (!canManage) {
          toast({
            title: 'Acesso negado',
            description: 'Você não possui permissão para gerenciar esta igreja.',
            variant: 'destructive'
          });
        }
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
    return <Navigate to="/admin/hodos/igrejas" replace />;
  }

  return <>{children}</>;
};

export default ChurchAdminRoute;
