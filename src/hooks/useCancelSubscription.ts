import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancelSubscriptionData {
  userId: string;
  subscriptionId: string;
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CancelSubscriptionData) => {
      console.log('🔄 Cancelando subscription:', data);

      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', data.subscriptionId);

      if (subscriptionError) {
        console.error('❌ Erro ao cancelar subscription:', subscriptionError);
        throw new Error(`Erro ao cancelar assinatura: ${subscriptionError.message}`);
      }

      console.log('✅ Subscription cancelada');

      // Update profile to remove subscription_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_id: null })
        .eq('id', data.userId);

      if (profileError) {
        console.error('❌ Erro ao atualizar profile:', profileError);
        throw new Error(`Erro ao desvincular assinatura: ${profileError.message}`);
      }

      console.log('✅ Profile atualizado (subscription_id removido)');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso',
        description: 'Assinatura cancelada com sucesso',
      });
    },
    onError: (error: any) => {
      console.error('Error canceling subscription:', error);
      const errorMessage = error?.message || 'Não foi possível cancelar a assinatura';
      toast({
        title: 'Erro ao Cancelar Assinatura',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
