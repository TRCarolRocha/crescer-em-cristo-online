import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpgradePlanData {
  newPlanType: 'individual' | 'church_simple' | 'church_plus' | 'church_premium';
  amount: number;
  churchData?: any;
}

export const useUpgradePlan = () => {
  const mutation = useMutation({
    mutationFn: async ({ newPlanType, amount, churchData }: UpgradePlanData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Generate confirmation code
      const { data: code, error: codeError } = await supabase
        .rpc('generate_confirmation_code');
      
      if (codeError) throw codeError;

      // Insert pending payment with upgrade flag
      const { data, error } = await supabase
        .from('pending_payments')
        .insert({
          plan_type: newPlanType,
          user_id: user.id,
          amount,
          church_data: churchData || null,
          confirmation_code: code,
          payment_method: 'pix',
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return {
    upgradePlan: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
