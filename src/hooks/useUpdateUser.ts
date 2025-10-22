import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UpdateUserData {
  userId: string;
  full_name?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  church_id?: string | null;
  roles?: AppRole[];
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const { userId, roles, ...profileData } = data;

      // Update profile
      if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      // Update roles if provided
      if (roles !== undefined) {
        // Get current roles
        const { data: currentRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        const currentRoleNames = (currentRoles?.map(r => r.role) || []) as AppRole[];

        // Roles to add
        const rolesToAdd = roles.filter(r => !currentRoleNames.includes(r));
        
        // Roles to remove
        const rolesToRemove = currentRoleNames.filter(r => !roles.includes(r));

        // Add new roles
        if (rolesToAdd.length > 0) {
          const { error: addError } = await supabase
            .from('user_roles')
            .insert(rolesToAdd.map(role => ({ user_id: userId, role: role as AppRole })));

          if (addError) throw addError;
        }

        // Remove old roles
        if (rolesToRemove.length > 0) {
          const { error: removeError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .in('role', rolesToRemove as AppRole[]);

          if (removeError) throw removeError;
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário',
        variant: 'destructive',
      });
    },
  });
};
