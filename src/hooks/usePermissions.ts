import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles } from '@/utils/roleUtils';
import { supabase } from '@/integrations/supabase/client';

export type PermissionLevel = 'super_admin' | 'church_admin' | 'user' | 'public';

interface UsePermissionsReturn {
  isSuperAdmin: boolean;
  isChurchAdmin: boolean;
  isUser: boolean;
  permissionLevel: PermissionLevel;
  loading: boolean;
  canManageChurch: (churchId: string) => Promise<boolean>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isChurchAdmin, setIsChurchAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setIsChurchAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const roles = await getUserRoles(user.id);
        setIsSuperAdmin(roles.includes('super_admin'));
        setIsChurchAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error checking permissions:', error);
        setIsSuperAdmin(false);
        setIsChurchAdmin(false);
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
    : user
    ? 'user'
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
    isUser: !!user,
    permissionLevel,
    loading,
    canManageChurch,
  };
};
