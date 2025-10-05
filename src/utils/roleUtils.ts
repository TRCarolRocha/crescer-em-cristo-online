import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'lider' | 'member';

export const getUserRoles = async (userId?: string): Promise<AppRole[]> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId);
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    return (data?.map(r => r.role as AppRole) || []);
  } catch (error) {
    console.error('Error in getUserRoles:', error);
    return [];
  }
};

export const hasRole = async (role: AppRole, userId?: string): Promise<boolean> => {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
};

export const isAdmin = async (userId?: string): Promise<boolean> => {
  return hasRole('admin', userId);
};

export const isLider = async (userId?: string): Promise<boolean> => {
  return hasRole('lider', userId);
};

export const addRole = async (userId: string, role: AppRole): Promise<void> => {
  await supabase.from('user_roles').upsert({
    user_id: userId,
    role
  }, { onConflict: 'user_id,role' });
};

export const removeRole = async (userId: string, role: AppRole): Promise<void> => {
  await supabase.from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
};
