import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurchData {
  church_name: string;
  cnpj?: string;
  cpf?: string;
  address: string;
  responsible_name: string;
  responsible_email: string;
  responsible_phone: string;
}

export const useApprovePayment = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (paymentId: string) => {
      // Get current user (super admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autorizado');

      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('pending_payments')
        .select('id, plan_type, plan_id, user_id, church_data, amount, status, confirmation_code')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      if (payment.status !== 'pending') throw new Error('Pagamento já foi processado');

      // Get plan details - prioritize plan_id from pending_payment
      let planId = payment.plan_id;
      let planDetails = null;
      
      if (planId) {
        // Use specific plan from pending_payment
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .maybeSingle();
        planDetails = plan;
      } else {
        // Fallback: search by plan_type
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('plan_type', payment.plan_type)
          .order('price_monthly', { ascending: true })
          .limit(1)
          .maybeSingle();
        planDetails = plan;
        planId = plan?.id;
      }
      
      if (!planId || !planDetails) throw new Error('Plano não encontrado');

      let churchId = null;

      // If church plan, create church
      if (payment.plan_type.startsWith('church') && payment.church_data) {
        const churchData = payment.church_data as unknown as ChurchData;
        
        // Generate unique slug from church name
        const baseSlug = churchData.church_name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if slug exists and make it unique
        let slug = baseSlug;
        let counter = 1;
        while (true) {
          const { data: existingChurch } = await supabase
            .from('churches')
            .select('id')
            .eq('slug', slug)
            .single();

          if (!existingChurch) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Create church
        const { data: newChurch, error: churchError } = await supabase
          .from('churches')
          .insert({
            name: churchData.church_name,
            slug,
            cnpj: churchData.cnpj || null,
            cpf: churchData.cpf || null,
            address: churchData.address,
            responsible_name: churchData.responsible_name,
            responsible_email: churchData.responsible_email,
            responsible_phone: churchData.responsible_phone,
            is_active: true,
            is_public: false,
          })
          .select()
          .single();

        if (churchError) throw churchError;
        churchId = newChurch.id;

        // Add admin role for church
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: payment.user_id,
            role: 'admin',
            church_id: churchId,
          });

        if (roleError) throw roleError;

        // Update user profile with church_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ church_id: churchId })
          .eq('id', payment.user_id);

        if (profileError) throw profileError;
      }

      // Create subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          plan_id: planId,
          user_id: payment.user_id,
          church_id: churchId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Update profile subscription_id if individual plan
      if (!churchId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_id: subscription.id })
          .eq('id', payment.user_id);

        if (profileError) throw profileError;
      }

      // Update church subscription_id if church plan
      if (churchId) {
        const { error: churchUpdateError } = await supabase
          .from('churches')
          .update({ subscription_id: subscription.id })
          .eq('id', churchId);

        if (churchUpdateError) throw churchUpdateError;
      }

      // Update pending_payment status
      const { error: updateError } = await supabase
        .from('pending_payments')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Send welcome email
      try {
        const isChurchPlan = payment.plan_type.startsWith('church');
        let churchSlug = null;
        
        if (isChurchPlan && churchId) {
          const { data: church } = await supabase
            .from('churches')
            .select('slug')
            .eq('id', churchId)
            .single();
          churchSlug = church?.slug;
        }

        await supabase.functions.invoke('send-subscription-email', {
          body: {
            type: isChurchPlan ? 'welcome-church' : 'welcome-individual',
            userId: payment.user_id,
            planType: payment.plan_type,
            planName: planDetails.name,
            planPrice: planDetails.price_monthly,
            planFeatures: planDetails.features,
            churchSlug
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-access'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    },
  });

  return {
    approvePayment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
