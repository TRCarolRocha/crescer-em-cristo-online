import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateSubscriptionData {
  userId: string;
  planId: string;
  expiresAt?: string;
  status?: 'active' | 'pending' | 'expired' | 'cancelled';
}

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      console.log('🔄 Criando nova subscription:', data);

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: data.userId,
          plan_id: data.planId,
          status: data.status || 'active',
          expires_at: data.expiresAt || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('❌ Erro ao criar subscription:', subscriptionError);
        throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`);
      }

      console.log('✅ Subscription criada:', subscription);

      // Update profile with subscription_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_id: subscription.id })
        .eq('id', data.userId);

      if (profileError) {
        console.error('❌ Erro ao atualizar profile:', profileError);
        throw new Error(`Erro ao vincular assinatura: ${profileError.message}`);
      }

      console.log('✅ Profile atualizado com subscription_id');
      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso',
        description: 'Assinatura criada com sucesso',
      });
    },
    onError: (error: any) => {
      console.error('Error creating subscription:', error);
      const errorMessage = error?.message || 'Não foi possível criar a assinatura';
      toast({
        title: 'Erro ao Criar Assinatura',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
