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

      console.log('🔄 Iniciando atualização de usuário:', { userId, hasProfile: Object.keys(profileData).length > 0, roles });

      try {
        // Update profile
        if (Object.keys(profileData).length > 0) {
          console.log('📝 Atualizando perfil:', profileData);
          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Erro ao atualizar perfil:', profileError);
            throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
          }
          console.log('✅ Perfil atualizado com sucesso');
        }

        // Update roles if provided
        if (roles !== undefined) {
          console.log('🔐 Atualizando roles para:', roles);
          
          // Get current roles
          const { data: currentRoles, error: fetchError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);

          if (fetchError) {
            console.error('❌ Erro ao buscar roles atuais:', fetchError);
            throw new Error(`Erro ao buscar roles: ${fetchError.message}`);
          }

          const currentRoleNames = (currentRoles?.map(r => r.role) || []) as AppRole[];
          console.log('📋 Roles atuais:', currentRoleNames);

          // Roles to add
          const rolesToAdd = roles.filter(r => !currentRoleNames.includes(r));
          console.log('➕ Roles para adicionar:', rolesToAdd);
          
          // Roles to remove
          const rolesToRemove = currentRoleNames.filter(r => !roles.includes(r));
          console.log('➖ Roles para remover:', rolesToRemove);

          // Add new roles
          if (rolesToAdd.length > 0) {
            const { error: addError } = await supabase
              .from('user_roles')
              .insert(rolesToAdd.map(role => ({ user_id: userId, role: role as AppRole })));

            if (addError) {
              console.error('❌ Erro ao adicionar roles:', addError);
              throw new Error(`Erro ao adicionar roles: ${addError.message}`);
            }
            console.log('✅ Roles adicionadas com sucesso');
          }

          // Remove old roles
          if (rolesToRemove.length > 0) {
            const { error: removeError } = await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', userId)
              .in('role', rolesToRemove as AppRole[]);

            if (removeError) {
              console.error('❌ Erro ao remover roles:', removeError);
              throw new Error(`Erro ao remover roles: ${removeError.message}`);
            }
            console.log('✅ Roles removidas com sucesso');
          }
        }

        console.log('✅ Atualização de usuário concluída com sucesso');
        return { success: true };
      } catch (error) {
        console.error('❌ Erro geral na atualização:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      const errorMessage = error?.message || 'Não foi possível atualizar o usuário';
      toast({
        title: 'Erro ao Atualizar Usuário',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
