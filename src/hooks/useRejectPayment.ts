import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurchData {
  responsible_name?: string;
}

export const useRejectPayment = () => {
  const mutation = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      // Get current user (super admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autorizado');

      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('pending_payments')
        .select('id, plan_type, user_id, church_data, amount, status, confirmation_code')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      if (payment.status !== 'pending') throw new Error('Pagamento já foi processado');

      // Update pending_payment status
      const { error: updateError } = await supabase
        .from('pending_payments')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(payment.user_id);
      const userEmail = userData?.user?.email;

      // NOTE: E-mails temporariamente desabilitados (sem domínio verificado)
      // Admin deve comunicar rejeição por outro canal (WhatsApp, telefone, etc.)
      try {
        if (userEmail) {
          const churchData = payment.church_data as unknown as ChurchData | null;
          await supabase.functions.invoke('send-subscription-email', {
            body: {
              type: 'rejection',
              to: userEmail,
              userName: churchData?.responsible_name || userData?.user?.user_metadata?.full_name,
              planType: payment.plan_type,
              rejectionReason: reason,
              confirmationCode: payment.confirmation_code,
            },
          });
        }
      } catch (emailError) {
        // Silenciosamente ignora erros de e-mail (esperado sem domínio configurado)
        console.log('E-mail de rejeição não enviado (configuração pendente):', emailError);
      }

      return { success: true };
    },
  });

  return {
    rejectPayment: (paymentId: string, reason: string) =>
      mutation.mutateAsync({ paymentId, reason }),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
