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
        .select('id, plan_type, user_id, church_data, amount, status, confirmation_code')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      if (payment.status !== 'pending') throw new Error('Pagamento já foi processado');

      // Get plan_id from subscription_plans
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('plan_type', payment.plan_type)
        .single();

      if (planError) throw planError;

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

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
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          plan_id: plan.id,
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

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(payment.user_id);
    const userEmail = userData?.user?.email;

    // Send email notification with better error handling
    if (userEmail) {
      try {
        const churchData = payment.church_data as unknown as ChurchData | null;
        const { data: invokeData, error: emailError } = await supabase.functions.invoke('send-subscription-email', {
          body: {
            type: payment.plan_type.startsWith('church') ? 'welcome-church' : 'welcome-individual',
            to: userEmail,
            userName: churchData?.responsible_name || userData?.user?.user_metadata?.full_name,
            planType: payment.plan_type,
            churchSlug: churchId ? (await supabase.from('churches').select('slug').eq('id', churchId).single()).data?.slug : null,
          },
        });
        
        if (emailError) {
          console.error('Erro ao enviar email:', emailError);
        } else {
          console.log('Email enviado com sucesso:', invokeData);
        }
      } catch (emailErr) {
        console.error('Erro crítico no envio de email:', emailErr);
      }
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
