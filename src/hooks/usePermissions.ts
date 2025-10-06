import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles } from '@/utils/roleUtils';

export type PermissionLevel = 'super_admin' | 'church_admin' | 'user' | 'public';

interface UsePermissionsReturn {
  isSuperAdmin: boolean;
  isChurchAdmin: boolean;
  isUser: boolean;
  permissionLevel: PermissionLevel;
  loading: boolean;
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

  return {
    isSuperAdmin,
    isChurchAdmin,
    isUser: !!user,
    permissionLevel,
    loading,
  };
};
