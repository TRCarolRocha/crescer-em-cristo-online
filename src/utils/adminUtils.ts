import { supabase } from "@/integrations/supabase/client";
import { getUserRoles } from './roleUtils';

export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const roles = await getUserRoles(user.id);
    return roles.includes('admin') || roles.includes('super_admin');
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
};

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
};
