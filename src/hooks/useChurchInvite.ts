import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurchInviteData {
  churchSlug: string;
  fullName: string;
  email: string;
  password: string;
}

export const useChurchInvite = () => {
  const mutation = useMutation({
    mutationFn: async ({ churchSlug, fullName, email, password }: ChurchInviteData) => {
      // Verify church exists and is active
      const { data: church, error: churchError } = await supabase
        .from('churches')
        .select('id, name, is_active, subscription_id, subscriptions(status, expires_at, subscription_plans(max_members))')
        .eq('slug', churchSlug)
        .single();

      if (churchError || !church) throw new Error('Igreja não encontrada');
      if (!church.is_active) throw new Error('Igreja não está ativa');

      const subscription = church.subscriptions as any;
      if (!subscription || subscription.status !== 'active') {
        throw new Error('A igreja não possui uma assinatura ativa');
      }

      // Check member limit
      const maxMembers = subscription.subscription_plans?.max_members;
      if (maxMembers) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('church_id', church.id);

        if (count && count >= maxMembers) {
          throw new Error('Limite de membros atingido para esta igreja');
        }
      }

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/igreja/${churchSlug}`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // Update profile with church_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ church_id: church.id })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Add member role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'member',
          church_id: church.id,
        });

      if (roleError) throw roleError;

      return { church, user: authData.user };
    }
  });

  return {
    joinChurch: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
