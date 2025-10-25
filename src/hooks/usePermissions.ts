import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles } from '@/utils/roleUtils';
import { supabase } from '@/integrations/supabase/client';

export type PermissionLevel = 'super_admin' | 'church_admin' | 'lider' | 'member' | 'visitor' | 'public';

interface UsePermissionsReturn {
  isSuperAdmin: boolean;
  isChurchAdmin: boolean;
  isLider: boolean;
  isVisitor: boolean;
  isUser: boolean;
  permissionLevel: PermissionLevel;
  loading: boolean;
  canManageChurch: (churchId: string) => Promise<boolean>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isChurchAdmin, setIsChurchAdmin] = useState(false);
  const [isLider, setIsLider] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setIsChurchAdmin(false);
        setIsLider(false);
        setIsVisitor(false);
        setLoading(false);
        return;
      }

      try {
        const roles = await getUserRoles(user.id);
        
        // Verificar se tem subscription ativa (individual ou igreja)
        const { data: profile } = await supabase
          .from('profiles')
          .select('church_id, subscription_id')
          .eq('id', user.id)
          .maybeSingle();

        let hasActiveSubscription = false;

        // Check individual subscription
        if (profile?.subscription_id) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('id', profile.subscription_id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (sub) hasActiveSubscription = true;
        }

        // Check church subscription
        if (!hasActiveSubscription && profile?.church_id) {
          const { data: church } = await supabase
            .from('churches')
            .select('subscription_id')
            .eq('id', profile.church_id)
            .maybeSingle();

          if (church?.subscription_id) {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('id', church.subscription_id)
              .eq('status', 'active')
              .maybeSingle();
            
            if (sub) hasActiveSubscription = true;
          }
        }
        
        // Usuário sem role MAS com subscription ativa = member (não visitor)
        if (roles.length === 0) {
          setIsVisitor(!hasActiveSubscription); // visitor só se NÃO tiver subscription
          setIsSuperAdmin(false);
          setIsChurchAdmin(false);
          setIsLider(false);
        } else {
          setIsSuperAdmin(roles.includes('super_admin'));
          setIsChurchAdmin(roles.includes('admin'));
          setIsLider(roles.includes('lider'));
          setIsVisitor(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setIsSuperAdmin(false);
        setIsChurchAdmin(false);
        setIsLider(false);
        setIsVisitor(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user]);

  const permissionLevel: PermissionLevel = isSuperAdmin
    ? 'super_admin'
    : isChurchAdmin
    ? 'church_admin'
    : isLider
    ? 'lider'
    : isVisitor
    ? 'visitor'
    : user
    ? 'member'
    : 'public';

  const canManageChurch = async (churchId: string): Promise<boolean> => {
    if (!user) return false;

    // Super admin pode gerenciar qualquer igreja
    if (isSuperAdmin) return true;

    try {
      // Tenta usar a função RPC que já considera admin global (church_id IS NULL) e super_admin
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_church_admin', { p_church_id: churchId });
      if (!rpcError && typeof rpcResult === 'boolean') {
        return rpcResult;
      }
      if (rpcError) {
        console.warn('RPC is_church_admin falhou, usando fallback:', rpcError.message);
      }
    } catch (e) {
      console.warn('Erro ao chamar RPC is_church_admin, usando fallback:', e);
    }

    // Fallback: verificar se é admin da igreja específica OU admin global (church_id IS NULL)
    const { data: roleRow, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .or(`church_id.eq.${churchId},church_id.is.null`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking church admin permission (fallback):', error);
      return false;
    }

    return !!roleRow;
  };

  return {
    isSuperAdmin,
    isChurchAdmin,
    isLider,
    isVisitor,
    isUser: !!user,
    permissionLevel,
    loading,
    canManageChurch,
  };
};
