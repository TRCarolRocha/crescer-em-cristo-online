import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PendingPaymentData {
  planType: 'individual' | 'church_simple' | 'church_plus' | 'church_premium';
  planId?: string;
  amount: number;
  churchData?: any;
}

export const useCreatePendingPayment = () => {
  const mutation = useMutation({
    mutationFn: async ({ planType, planId, amount, churchData }: PendingPaymentData) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Você precisa estar logado para continuar. Por favor, confirme seu email e faça login novamente.');
      }

      // Check for existing pending payment
      const { data: existingPayment } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('plan_type', planType)
        .maybeSingle();

      // If exists, return it instead of creating a new one
      if (existingPayment) {
        return existingPayment;
      }

      // Generate confirmation code
      const { data: code, error: codeError } = await supabase
        .rpc('generate_confirmation_code');
      
      if (codeError) throw codeError;

      // Insert pending payment
      const { data, error } = await supabase
        .from('pending_payments')
        .insert({
          plan_type: planType,
          plan_id: planId || null,
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

      // NOTE: E-mails temporariamente desabilitados (sem domínio verificado)
      // O código de confirmação será exibido na tela para o usuário
      try {
        await supabase.functions.invoke('send-subscription-email', {
          body: {
            type: 'payment-pending',
            userId: user.id,
            userName: user.user_metadata?.full_name || 'Usuário',
            confirmationCode: code,
            planType: planType,
          },
        });
      } catch (emailErr) {
        // Silenciosamente ignora erros de e-mail (esperado sem domínio configurado)
        console.log('E-mail não enviado (configuração pendente):', emailErr);
      }

      return data;
    }
  });

  return {
    createPendingPayment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};
