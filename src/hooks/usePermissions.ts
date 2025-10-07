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
    
    // Verificar se é admin da igreja específica
    const { data, error } = await supabase
      .from('user_roles')
      .select('church_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('church_id', churchId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking church admin permission:', error);
      return false;
    }
    
    return !!data;
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
