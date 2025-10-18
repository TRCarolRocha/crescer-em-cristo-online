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
      // Verify church exists and is active (simplified to avoid RLS issues)
      const { data: church, error: churchError } = await supabase
        .from('churches')
        .select('id, name, is_active, slug')
        .eq('slug', churchSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (churchError) {
        console.error('Erro ao buscar igreja:', {
          slug: churchSlug,
          error: churchError,
          code: churchError.code,
          details: churchError.details,
          message: churchError.message
        });
        throw new Error(`Igreja "${churchSlug}" não encontrada ou não está ativa`);
      }
      
      if (!church) {
        throw new Error(`Igreja "${churchSlug}" não encontrada ou não está ativa`);
      }

      // Save church data to localStorage for linking after email confirmation
      localStorage.setItem('pending_church_slug', churchSlug);
      localStorage.setItem('pending_church_id', church.id);

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // If user is immediately confirmed (no email confirmation needed), link now
      if (authData.session) {
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

        // Clear localStorage since linking was successful
        localStorage.removeItem('pending_church_slug');
        localStorage.removeItem('pending_church_id');
      }

      return { church, user: authData.user };
    }
  });

  return {
    joinChurch: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
