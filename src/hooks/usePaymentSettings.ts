import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentSettings = (planId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['payment-settings', planId],
    queryFn: async () => {
      let query = supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true);

      // Se planId for fornecido, buscar config específica do plano
      if (planId) {
        query = query.eq('plan_id', planId);
      } else {
        // Buscar configuração global (fallback)
        query = query.is('plan_id', null);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      
      // Se não encontrou config específica e planId foi fornecido, buscar global
      if (!data && planId) {
        const { data: globalData, error: globalError } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('is_active', true)
          .is('plan_id', null)
          .maybeSingle();
        
        if (globalError) throw globalError;
        return globalData;
      }
      
      return data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (data: { 
      pix_key: string; 
      pix_type: string; 
      qr_code_url?: string; 
      pix_copia_cola?: string; 
      external_payment_link?: string;
      plan_id?: string 
    }) => {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          qr_code_url: data.qr_code_url,
          pix_copia_cola: data.pix_copia_cola,
          external_payment_link: data.external_payment_link
        })
        .eq('is_active', true)
        .match(data.plan_id ? { plan_id: data.plan_id } : { plan_id: null });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    }
  });

  const createSettings = useMutation({
    mutationFn: async (data: { 
      pix_key: string; 
      pix_type: string; 
      qr_code_url?: string; 
      pix_copia_cola?: string; 
      external_payment_link?: string;
      plan_id?: string 
    }) => {
      const { error } = await supabase
        .from('payment_settings')
        .insert({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          qr_code_url: data.qr_code_url,
          pix_copia_cola: data.pix_copia_cola,
          external_payment_link: data.external_payment_link,
          plan_id: data.plan_id || null,
          is_active: true
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    }
  });

  return { 
    settings, 
    isLoading, 
    error, 
    updateSettings: updateSettings.mutateAsync,
    createSettings: createSettings.mutateAsync 
  };
};
